import React from 'react';

// 组件类型枚举
export enum ComponentType {
  HEADER = 'header',
  BUTTON = 'button',
  TEXT = 'text',
  IMAGE = 'image',
  CARD = 'card',
  LIST = 'list'
}

// 基础组件配置接口
export interface BaseComponentConfig {
  id: string;
  type: ComponentType;
  props: Record<string, any>;
  style?: React.CSSProperties;
  children?: ComponentConfig[];
}

// 具体组件配置类型
export interface HeaderConfig extends BaseComponentConfig {
  type: ComponentType.HEADER;
  props: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

export interface ButtonConfig extends BaseComponentConfig {
  type: ComponentType.BUTTON;
  props: {
    text: string;
    onClick?: string; // 事件处理器名称
    variant?: 'primary' | 'secondary' | 'danger';
  };
}

export interface TextConfig extends BaseComponentConfig {
  type: ComponentType.TEXT;
  props: {
    content: string;
    size?: 'small' | 'medium' | 'large';
  };
}

export interface ImageConfig extends BaseComponentConfig {
  type: ComponentType.IMAGE;
  props: {
    src: string;
    alt: string;
    width?: number;
    height?: number;
  };
}

export interface CardConfig extends BaseComponentConfig {
  type: ComponentType.CARD;
  props: {
    title?: string;
    padding?: number;
  };
}

export interface ListConfig extends BaseComponentConfig {
  type: ComponentType.LIST;
  props: {
    items: string[];
    ordered?: boolean;
  };
}

// 联合类型
export type ComponentConfig = 
  | HeaderConfig 
  | ButtonConfig 
  | TextConfig 
  | ImageConfig 
  | CardConfig 
  | ListConfig;

// 页面配置
export interface PageConfig {
  id: string;
  title: string;
  components: ComponentConfig[];
}

// WebSocket消息类型
export interface WSMessage {
  type: 'page_update' | 'component_update' | 'component_add' | 'component_remove';
  payload: PageConfig | ComponentConfig | string;
}