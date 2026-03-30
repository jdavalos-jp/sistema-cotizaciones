import React from 'react'
import React from 'react'
import PropTypes from 'prop-types'
import { Form, Cascader } from 'antd'

function CategoriaSelector({ options, loading, placeholder, value, onChange }) {
  return (
    <Form.Item
      label="Subcategoría"
      name="categoriaPath"
      rules={[{ required: true, message: 'Selecciona una subcategoría' }]}
    >
      <Cascader
        options={options}
        loading={loading}
        placeholder={placeholder}
        showSearch
        allowClear
        value={value}
        onChange={onChange}
      />
    </Form.Item>
  )
}

CategoriaSelector.propTypes = {
  options: PropTypes.array.isRequired,
  loading: PropTypes.bool.isRequired,
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.array,
  onChange: PropTypes.func.isRequired,
}

export default CategoriaSelector