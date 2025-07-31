import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from "class-validator";

export function IsValidPhoneNumber(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: "isValidPhoneNumber",
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== "string") return false;
          // Basic phone number validation - can be enhanced based on requirements
          const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
          return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ""));
        },
        defaultMessage(args: ValidationArguments) {
          return "Phone number must be a valid format";
        },
      },
    });
  };
}
