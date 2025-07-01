// 简化版动态组件 - 使用纯JavaScript
function DynamicComponent({ config, onEvent }) {
  const handleClick = (eventName) => {
    if (eventName && onEvent) {
      onEvent(eventName, config.id);
    }
  };

  const getComponentStyle = (baseStyle = {}) => {
    return {
      margin: '10px',
      padding: '10px',
      borderRadius: '8px',
      ...baseStyle,
      ...config.style,
    };
  };

  const createElement = (tag, props, children) => {
    return React.createElement(tag, props, children);
  };

  switch (config.type) {
    case 'header':
      const HeaderTag = `h${config.props.level}`;
      return createElement(HeaderTag, {
        style: getComponentStyle({ color: '#333', fontWeight: 'bold' })
      }, config.props.text);

    case 'button':
      const buttonStyles = {
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
      
      return createElement('button', {
        style: getComponentStyle(buttonStyles),
        onClick: () => handleClick(config.props.onClick),
        onMouseEnter: (e) => {
          e.currentTarget.style.opacity = '0.8';
          e.currentTarget.style.transform = 'translateY(-2px)';
        },
        onMouseLeave: (e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(0)';
        }
      }, config.props.text);

    case 'text':
      const textSize = {
        small: '14px',
        medium: '16px',
        large: '20px',
      }[config.props.size || 'medium'];
      
      return createElement('p', {
        style: getComponentStyle({ 
          fontSize: textSize, 
          lineHeight: '1.5',
          color: '#333' 
        })
      }, config.props.content);

    case 'image':
      return createElement('img', {
        src: config.props.src,
        alt: config.props.alt,
        width: config.props.width,
        height: config.props.height,
        style: getComponentStyle({ 
          maxWidth: '100%', 
          height: 'auto',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        })
      });

    case 'card':
      const cardChildren = [];
      if (config.props.title) {
        cardChildren.push(
          createElement('h3', {
            key: 'title',
            style: { marginTop: 0, color: '#333', fontWeight: 'bold' }
          }, config.props.title)
        );
      }
      if (config.children) {
        config.children.forEach((childConfig) => {
          cardChildren.push(
            createElement(DynamicComponent, {
              key: childConfig.id,
              config: childConfig,
              onEvent: onEvent
            })
          );
        });
      }
      
      return createElement('div', {
        style: getComponentStyle({
          backgroundColor: 'white',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          padding: config.props.padding || 20,
        })
      }, cardChildren);

    case 'list':
      const ListTag = config.props.ordered ? 'ol' : 'ul';
      const listItems = config.props.items.map((item, index) =>
        createElement('li', {
          key: index,
          style: { 
            margin: '8px 0', 
            color: '#333',
            fontSize: '16px' 
          }
        }, item)
      );
      
      return createElement(ListTag, {
        style: getComponentStyle({ 
          paddingLeft: '20px',
          backgroundColor: 'rgba(255,255,255,0.9)',
        })
      }, listItems);

    default:
      return createElement('div', {
        style: getComponentStyle({ 
          backgroundColor: '#f8f9fa', 
          border: '1px dashed #ccc',
          color: '#6c757d'
        })
      }, `Unknown component type: ${config.type}`);
  }
}

export default DynamicComponent;