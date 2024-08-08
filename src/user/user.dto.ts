import { z } from 'zod';

export const createUserSchema = z
  .object({
    id: z.string().uuid().optional(),

    name: z.string()
      .refine((name) => {
        return name.length >= 3 && name.length <= 19;
      }, {
        message: 'Name must be between 2 to 20 characters',
      })
      .refine((name) => {
        return name.match(/^[A-Za-z]+$/);
      }, {
        message: 'Name should only contain letters',
      }),

    surname: z.string()
      .refine((surname) => {
        return surname.length >= 1 && surname.length <= 19;
      }, {
        message: 'Surname must be between 0 to 20 characters',
      })
      .refine((surname) => {
        return surname.match(/^[A-Za-z]+$/);
      }, {
        message: 'Surname should only contain letters',
      }),

    username: z.string()
      .refine((username) => {
        return username.length >= 4 && username.length <= 19;
      }, {
        message: 'Username must be between 3 to 20 characters',
      })
      .refine((username) => {
        return username.match(/^[A-Za-z0-9]+$/);
      }, {
        message: 'Username should only contain letters and numbers',
      }),

    birthdate: z.string().datetime()
      .refine((birthdate) => {
        return !isNaN(new Date(birthdate).getTime())
      }, {
        message: 'Date of birth should be in the format YYYY-MM-DDTHH:MM:SS.mmmmmmZ',
      })
      .refine((birthdate) => {
        return new Date() >= new Date(birthdate)
      }, {
        message: 'Date of birth cannot be in the future',
      })
      .refine((birthDate) => {
        const today = new Date();
        const maxAllowedYear = today.getFullYear() - 120;
        const birthYear = new Date(birthDate).getFullYear();
        return birthYear >= maxAllowedYear;
      }, {
        message: 'Date of birth must be within the last 120 years.',
      })
  })
  // .required();

export type CreateUserDto = z.infer<typeof createUserSchema>;