import { gql } from '@apollo/client';

// Olfactive Family Queries
export const GET_ALL_OLFACTIVE_FAMILIES = gql`
  query GetAllOlfactiveFamilies {
    getAllOlfactiveFamilies {
      id
      name
      description
      createdAt
    }
  }
`;

// Ingredient Queries
export const GET_ALL_INGREDIENTS = gql`
  query GetAllIngredients {
    getAllIngredients {
      id
      name
      description
      casNumber
      iupacName
      tenacity
      diffusion
      allergens {
        id
        name
        regulatoryLimit
      }
      olfactiveFamily {
        id
        name
      }
      createdAt
    }
  }
`;

export const GET_INGREDIENT_BY_ID = gql`
  query GetIngredientById($id: ID!) {
    getIngredientById(id: $id) {
      id
      name
      description
      casNumber
      iupacName
      tenacity
      diffusion
      allergens {
        id
        name
        regulatoryLimit
      }
      olfactiveFamily {
        id
        name
      }
      createdAt
    }
  }
`;

// Formula Queries
export const GET_ALL_FORMULAS = gql`
  query GetAllFormulas {
    getAllFormulas {
      id
      name
      description
      targetGender
      difficulty
      ingredients {
        id
        percentage
        ingredient {
          id
          name
          description
          tenacity
          diffusion
          allergens {
            id
            name
            casNumber
            regulatoryLimit
          }
          olfactiveFamily {
            id
            name
          }
        }
      }
      createdAt
    }
  }
`;

export const GET_FORMULA_BY_ID = gql`
  query GetFormulaById($id: ID!) {
    getFormulaById(id: $id) {
      id
      name
      description
      targetGender
      difficulty
      ingredients {
        id
        percentage
        ingredient {
          id
          name
          description
          tenacity
          diffusion
          allergens {
            id
            name
            casNumber
            regulatoryLimit
          }
          olfactiveFamily {
            id
            name
          }
        }
      }
      createdAt
    }
  }
`;

// Formula Mutations
export const CREATE_FORMULA = gql`
  mutation CreateFormula($input: CreateFormulaInput!) {
    createFormula(input: $input) {
      id
      name
      description
      targetGender
      difficulty
    }
  }
`;

export const UPDATE_FORMULA = gql`
  mutation UpdateFormula($id: ID!, $input: UpdateFormulaInput!) {
    updateFormula(id: $id, input: $input) {
      id
      name
      description
      targetGender
      difficulty
    }
  }
`;

export const DELETE_FORMULA = gql`
  mutation DeleteFormula($id: ID!) {
    deleteFormula(id: $id)
  }
`;

// Allergen Queries
export const GET_ALL_ALLERGENS = gql`
  query GetAllAllergens {
    getAllAllergens {
      id
      name
      casNumber
      regulatoryLimit
      createdAt
    }
  }
`;

// TypeScript Types
export interface OlfactiveFamily {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export interface Allergen {
  id: string;
  name: string;
  casNumber?: string;
  regulatoryLimit: number;
  createdAt: string;
}

export interface Ingredient {
  id: string;
  name: string;
  description: string;
  casNumber?: string;
  iupacName?: string;
  tenacity: string;
  diffusion: string;
  allergens: Allergen[];
  olfactiveFamily: OlfactiveFamily;
  createdAt: string;
}

export interface FormulaIngredient {
  id: string;
  percentage: number;
  ingredient: Ingredient;
}

export interface Formula {
  id: string;
  name: string;
  description: string;
  targetGender: string;
  difficulty: string;
  ingredients: FormulaIngredient[];
  createdAt: string;
}

export interface CreateFormulaInput {
  name: string;
  description: string;
  targetGender: string;
  difficulty: string;
}

export interface UpdateFormulaInput {
  name?: string;
  description?: string;
  targetGender?: string;
  difficulty?: string;
}
