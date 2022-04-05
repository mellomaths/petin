import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';
import { AgeType } from 'src/pets/entities/pet.entity';

export function IsValidAge(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      name: 'IsValidAge',
      target: object.constructor,
      propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];

          if (relatedValue == AgeType.MONTH && parseInt(value) > 11) {
            return false;
          }

          return true;
        },

        defaultMessage(args: ValidationArguments) {
          return `If ageType is MONTH, age must be less than 12`;
        },
      },
    });
  };
}
