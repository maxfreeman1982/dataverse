import { gql } from '@apollo/client';

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      accessToken
      user {
        id
        email
        fullName
        isActive
        roles
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      accessToken
      user {
        id
        email
        fullName
        isActive
        roles
      }
    }
  }
`;

export const ME = gql`
  query Me {
    me {
      id
      email
      fullName
      firstName
      lastName
      avatar
      isActive
      isEmailVerified
      roles
      createdAt
    }
  }
`;

export interface User {
  id: string;
  email: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  roles: string[];
  createdAt: string;
}

export interface AuthPayload {
  accessToken: string;
  user: User;
}

export interface RegisterInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
