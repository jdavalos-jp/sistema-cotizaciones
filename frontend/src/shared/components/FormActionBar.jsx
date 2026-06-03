import React from 'react'
import { Button, Space, Typography } from 'antd'

const { Text } = Typography

function FormActionBar({ left, actions = [], maxWidth = 1180 }) {
  return (
    <div
      style={{
        position: 'sticky',
        bottom: 0,
        zIndex: 20,
        marginTop: 24,
        marginLeft: -24,
        marginRight: -24,
        padding: '12px 24px',
        background: 'rgba(255,255,255,0.96)',
        borderTop: '1px solid #e8e8e8',
        boxShadow: '0 -8px 24px rgba(15, 23, 42, 0.08)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        style={{
          maxWidth,
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <Text type="secondary">{left}</Text>

        <Space size={10} wrap>
          {actions.map((action) => (
            <Button
              key={action.key || action.label}
              type={action.type}
              danger={action.danger}
              htmlType={action.htmlType}
              icon={action.icon}
              loading={action.loading}
              disabled={action.disabled}
              onClick={action.onClick}
              size="large"
              style={{
                borderRadius: 8,
                minWidth: action.minWidth || 112,
                fontWeight: action.type === 'primary' ? 600 : 500,
                ...action.style,
              }}
            >
              {action.label}
            </Button>
          ))}
        </Space>
      </div>
    </div>
  )
}

export default FormActionBar
