package chat

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/gorilla/websocket"
	repo "github.com/mellomaths/petin/backend/core/internal/adapters/postgresql/sqlc"
	"go.uber.org/zap"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow all origins in development - should be restricted in production
	},
}

type WebSocketMessage struct {
	Type          string `json:"type"` // "message", "typing", "read"
	Content       string `json:"content,omitempty"`
	SenderID      int64  `json:"sender_id,omitempty"`
	ConversationID int64 `json:"conversation_id,omitempty"`
	Timestamp     string `json:"timestamp,omitempty"`
}

type WebSocketServer struct {
	repo        repo.Querier
	chatSvc     Service
	connections map[int64]map[*websocket.Conn]bool // conversationID -> connections
	broadcast   chan WebSocketMessage
	register    chan *ClientConnection
	unregister  chan *ClientConnection
}

type ClientConnection struct {
	conn           *websocket.Conn
	conversationID int64
	profileID      int64
	ctx            context.Context
}

func NewWebSocketServer(repo repo.Querier, chatSvc Service) *WebSocketServer {
	return &WebSocketServer{
		repo:        repo,
		chatSvc:     chatSvc,
		connections: make(map[int64]map[*websocket.Conn]bool),
		broadcast:   make(chan WebSocketMessage, 256),
		register:    make(chan *ClientConnection),
		unregister:  make(chan *ClientConnection),
	}
}

func (ws *WebSocketServer) HandleWebSocket(w http.ResponseWriter, r *http.Request, conversationExternalID string, profileID int64) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		zap.L().Error("failed to upgrade websocket", zap.Error(err))
		return
	}

	// Get conversation
	conversation, err := ws.repo.GetConversation(r.Context(), conversationExternalID)
	if err != nil {
		zap.L().Error("failed to get conversation for websocket", zap.Error(err))
		conn.Close()
		return
	}

	// Verify user is part of conversation
	if conversation.AdopterProfileID != profileID && conversation.OwnerProfileID != profileID {
		zap.L().Info("unauthorized websocket connection attempt", zap.Int64("profile_id", profileID), zap.Int64("conversation_id", conversation.ID))
		conn.Close()
		return
	}

	client := &ClientConnection{
		conn:           conn,
		conversationID: conversation.ID,
		profileID:      profileID,
		ctx:            r.Context(),
	}

	ws.register <- client

	go client.writePump(ws)
	go client.readPump(ws)
}

func (ws *WebSocketServer) Run() {
	for {
		select {
		case client := <-ws.register:
			if ws.connections[client.conversationID] == nil {
				ws.connections[client.conversationID] = make(map[*websocket.Conn]bool)
			}
			ws.connections[client.conversationID][client.conn] = true
			zap.L().Info("client registered", zap.Int64("conversation_id", client.conversationID))

		case client := <-ws.unregister:
			if connections, ok := ws.connections[client.conversationID]; ok {
				if _, ok := connections[client.conn]; ok {
					delete(connections, client.conn)
					client.conn.Close()
					if len(connections) == 0 {
						delete(ws.connections, client.conversationID)
					}
				}
			}
			zap.L().Info("client unregistered", zap.Int64("conversation_id", client.conversationID))

		case message := <-ws.broadcast:
			if connections, ok := ws.connections[message.ConversationID]; ok {
				for conn := range connections {
					err := conn.WriteJSON(message)
					if err != nil {
						zap.L().Error("websocket write error", zap.Error(err))
						conn.Close()
						delete(connections, conn)
					}
				}
			}
		}
	}
}

func (c *ClientConnection) readPump(ws *WebSocketServer) {
	defer func() {
		ws.unregister <- c
		c.conn.Close()
	}()

	for {
		_, messageBytes, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				zap.L().Error("websocket error", zap.Error(err))
			}
			break
		}

		var msg WebSocketMessage
		if err := json.Unmarshal(messageBytes, &msg); err != nil {
			zap.L().Error("failed to unmarshal websocket message", zap.Error(err))
			continue
		}

		// Handle message creation
		if msg.Type == "message" && msg.Content != "" {
			_, err := ws.chatSvc.CreateMessage(c.ctx, c.conversationID, c.profileID, CreateMessageParams{
				Content: msg.Content,
			})
			if err != nil {
				zap.L().Error("failed to create message via websocket", zap.Error(err))
				continue
			}

			// Broadcast to all connections in this conversation
			msg.SenderID = c.profileID
			msg.ConversationID = c.conversationID
			ws.broadcast <- msg
		}
	}
}

func (c *ClientConnection) writePump(ws *WebSocketServer) {
	// This can be used for sending pings/pongs if needed
}
