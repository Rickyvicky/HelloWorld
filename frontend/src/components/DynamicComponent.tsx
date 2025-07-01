import React from 'react';
import { ComponentConfig, ComponentType } from '../types';

interface DynamicComponentProps {
  config: ComponentConfig;
  onEvent?: (eventName: string, componentId: string) => void;
}

const DynamicComponent: React.FC<DynamicComponentProps> = ({ config, onEvent }) => {
  const handleClick = (eventName?: string) => {
    if (eventName && onEvent) {
      onEvent(eventName, config.id);
    }
  };

  const getComponentStyle = (baseStyle?: React.CSSProperties): React.CSSProperties => {
    return {
      margin: '10px',
      padding: '10px',
      borderRadius: '8px',
      ...baseStyle,
      ...config.style,
    };
  };

  switch (config.type) {
    case ComponentType.HEADER:
      const HeaderTag = `h${config.props.level}` as keyof JSX.IntrinsicElements;
      return (
        <HeaderTag style={getComponentStyle({ color: '#333', fontWeight: 'bold' })}>
          {config.props.text}
        </HeaderTag>
      );

    case ComponentType.BUTTON:
      const buttonStyles: React.CSSProperties = {
        backgroundColor: 
          config.props.variant === 'primary' ? '#007bff' :
          config.props.variant === 'danger' ? '#dc3545' : '#6c757d',
        color: 'white',
        border: 'none',
        padding: '12px 24px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold',
        transition: 'all 0.3s ease',
      };
      
      return (
        <button
          style={getComponentStyle(buttonStyles)}
          onClick={() => handleClick(config.props.onClick)}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.8';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          {config.props.text}
        </button>
      );

    case ComponentType.TEXT:
      const textSize = {
        small: '14px',
        medium: '16px',
        large: '20px',
      }[config.props.size || 'medium'];
      
      return (
        <p style={getComponentStyle({ 
          fontSize: textSize, 
          lineHeight: '1.5',
          color: '#333' 
        })}>
          {config.props.content}
        </p>
      );

    case ComponentType.IMAGE:
      return (
        <img
          src={config.props.src}
          alt={config.props.alt}
          width={config.props.width}
          height={config.props.height}
          style={getComponentStyle({ 
            maxWidth: '100%', 
            height: 'auto',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
          })}
        />
      );

    case ComponentType.CARD:
      return (
        <div style={getComponentStyle({
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: config.props.padding || 20,
        })}>
          {config.props.title && (
            <h3 style={{ marginTop: 0, color: '#333', fontWeight: 'bold' }}>
              {config.props.title}
            </h3>
          )}
          {config.children?.map((childConfig) => (
            <DynamicComponent
              key={childConfig.id}
              config={childConfig}
              onEvent={onEvent}
            />
          ))}
        </div>
      );

    case ComponentType.LIST:
      const ListTag = config.props.ordered ? 'ol' : 'ul';
      return (
        <ListTag style={getComponentStyle({ 
          paddingLeft: '20px',
          backgroundColor: 'rgba(255,255,255,0.9)',
        })}>
          {config.props.items.map((item: string, index: number) => (
            <li key={index} style={{ 
              margin: '8px 0', 
              color: '#333',
              fontSize: '16px' 
            }}>
              {item}
            </li>
          ))}
        </ListTag>
      );

    default:
      return (
        <div style={getComponentStyle({ 
          backgroundColor: '#f8f9fa', 
          border: '1px dashed #ccc',
          color: '#6c757d'
        })}>
          Unknown component type: {config.type}
        </div>
      );
  }
};

export default DynamicComponent;