"use client";

import {
  Form,
  Input,
  Button,
  Checkbox,
  Tag,
  Radio,
  Card,
  Image,
  Avatar,
  Typography,
  Row,
  Col,
  Divider,
} from "antd";
import {
  UserOutlined,
  LockOutlined,
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import {
  InfoCircleOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
} from "@ant-design/icons";
import { Layout } from "antd";
import { BrandColor, LogoFontFamily, TextFont } from "@/app/_config/branding";
import { useState } from "react";
import { LoginRequest } from "@/app/api/_core/types/petin-api";
import { redirect } from 'next/navigation';

const { Header, Footer, Content } = Layout;
const { Meta } = Card;
const { Title, Text, Link, Paragraph } = Typography;

const customizeRequiredMark = (
  label: React.ReactNode,
  { required }: { required: boolean }
) => (
  <>
    {required ? (
      <Tag className={TextFont.className} color={BrandColor}>
        obrigatório
      </Tag>
    ) : (
      <Tag className={TextFont.className} color={BrandColor}>
        opcional
      </Tag>
    )}
    {label}
  </>
);

export default function LoginForm({
  signIn,
}: {
  signIn({ email, password }: LoginRequest): Promise<void>;
}) {
  const [form] = Form.useForm();
  const [login, setLogin] = useState<LoginRequest>({ email: "", password: "" });

  const onLoginFormFinish = () => {
    signIn(login);
  };

  const onEmailTyping = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {    
    setLogin({ ...login, email: e.target.value });
  };

  const onPasswordTyping = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {    
    setLogin({ ...login, password: e.target.value });
  };

  return (
    <Layout style={{ backgroundColor: "inherit" }}>
      <Content>
        <div
          style={
            {
              // background: BrandColor,
              // minHeight: 280,
              // padding: 24,
              // borderRadius: borderRadiusLG,
            }
          }
        >
          <Row gutter={16}>
            <Col
              xl={16}
              style={{ textAlign: "center", justifyContent: "center" }}
            >
              <Text
                underline
                // level={2}
                style={{
                  width: "100%",
                  fontFamily: LogoFontFamily,
                  color: "white",
                  fontSize: 250,
                }}
              >
                Petin
              </Text>
              <Paragraph
                className={TextFont.className}
                style={{
                  padding: "50px",
                  width: "100%",
                  color: "white",
                  fontSize: 34,
                }}
              >
                O Petin ajuda você a se conectar com outros pais de pets e
                adotar o seu.
              </Paragraph>
            </Col>
            <Col xl={8} xs={24}>
              <Card
                style={{ width: "100%" }}
                cover={
                  <Image
                    alt='Pet banner'
                    src='/img/login/banners/random_dog_banner_1.png'
                    preview={false}
                  />
                }
              >
                <Meta
                  avatar={
                    <Avatar src='/img/login/avatars/random_dog_avatar_1.png' />
                  }
                  className={TextFont.className}
                  title='A rede social de Pets mais amada!'
                  description='Adoção responsável de animais. Não abandone seu pet na rua, doe para quem procura!'
                />

                <Form
                  style={{ marginTop: "25px" }}
                  form={form}
                  layout='vertical'
                  requiredMark={customizeRequiredMark}
                  onFinish={onLoginFormFinish}
                  size='large'
                >
                  <Form.Item
                    className={TextFont.className}
                    label='Endereço de e-mail'
                    required
                    tooltip={{
                      title:
                        "Informe seu endereço de e-mail",
                      icon: <InfoCircleOutlined color={BrandColor} />,
                    }}
                  >
                    <Input
                      className={TextFont.className}
                      prefix={<UserOutlined color={BrandColor} />}
                      placeholder='email@email.com'
                      value={login.email}
                      onChange={onEmailTyping}
                    />
                  </Form.Item>
                  <Form.Item
                    className={TextFont.className}
                    label='Senha'
                    required
                    tooltip={{
                      title: "Insira sua senha de pelo menos 8 caracteres",
                      icon: <InfoCircleOutlined color={BrandColor} />,
                    }}
                  >
                    <Input.Password
                      className={TextFont.className}
                      prefix={<LockOutlined color={BrandColor} />}
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                      value={login.password}
                      onChange={onPasswordTyping}
                    />
                  </Form.Item>
                  <Form.Item style={{ textAlign: "right" }}>
                    <Button
                      className={TextFont.className}
                      type='primary'
                      htmlType='submit'
                      style={{
                        backgroundColor: BrandColor,
                        marginBottom: "10px",
                      }}
                    >
                      Entrar
                    </Button>
                    <Text className={TextFont.className}>
                      <br />
                      Não possui uma conta?{" "}
                      <Link className={TextFont.className} href='/sign-up'>
                        Cadastre-se
                      </Link>
                      !
                    </Text>
                  </Form.Item>
                </Form>
                <Divider />
                <Row gutter={16}>
                  <Col
                    xs={24}
                    xl={24}
                    style={{ textAlign: "center", justifyContent: "center" }}
                  >
                    <Text className={TextFont.className}>
                      Baixe o nosso aplicativo.
                    </Text>
                  </Col>
                  <Col xs={24} xl={24}>
                    <Row
                      style={{
                        textAlign: "center",
                        justifyContent: "center",
                        marginTop: "15px",
                      }}
                    >
                      <Col xs={12} xl={12}>
                        <Image
                          style={{ width: 165, marginLeft: "20px" }}
                          alt='Google Play Store download app'
                          src='/img/login/stores/google_play_store.png'
                          preview={false}
                        />
                      </Col>
                      <Col xs={12} xl={12}>
                        <Image
                          style={{
                            height: 50,
                            width: 150,
                            marginRight: "50px",
                          }}
                          alt='Apple App store download app'
                          src='/img/login/stores/apple_app_store.png'
                          preview={false}
                        />
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
      {/* <Footer style={{ backgroundColor: "inherit" }}></Footer> */}
    </Layout>
  );
}
