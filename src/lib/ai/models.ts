//@ts-nocheck
// Define your models here.

export interface Model {
    id: string;
    label: string;
    apiIdentifier: string;
    description: string;
  }

/*  
export const models: Array<Model> = [
  {
    id: 'gpt-4o',
    label: 'Azure OpenAI',
    apiIdentifier: 'gpt-4o',
    description: 'Compliance assistant model',
  }
] as const;
  
export const DEFAULT_MODEL_NAME: string = 'gpt-4o';*/

export const models: Array<Model> = [
  {
    id: 'claude-sonnet-4-6',
    label: 'Anthropic',
    apiIdentifier: 'claude-sonnet-4-6',
    description: 'Compliance assistant model',
  },
  {
    id: 'gpt-4o',
    label: 'Azure OpenAI',
    apiIdentifier: 'gpt-4o',
    description: 'Compliance assistant model',
  }
] as const;
  
export const DEFAULT_MODEL_NAME: string = 'claude-sonnet-4-6';
