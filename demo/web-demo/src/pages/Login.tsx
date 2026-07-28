import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, Input, Button, Card, Typography, message, Tabs } from 'antd'
import { UserOutlined, LockOutlined } from '@ant-design/icons'
import { useAuth } from '../context/AuthContext'
import { loginApi, registerApi } from '../services/api'

const { Title, Paragraph } = Typography

export default function Login() {
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const onLogin = async (values: { username: string; password: string }) => {
    setLoading(true)
    try {
      const result = await loginApi(values)
      login(result.data.access_token)
      message.success('登录成功')
      navigate('/settings', { replace: true })
    } catch {
      message.error('登录失败，请检查用户名和密码')
    } finally {
      setLoading(false)
    }
  }

  const onRegister = async (values: {
    username: string
    password: string
    confirm: string
  }) => {
    setLoading(true)
    try {
      await registerApi({
        username: values.username,
        password: values.password,
      })
      message.success('注册成功，请登录')
    } catch {
      message.error('注册失败，用户名可能已存在')
    } finally {
      setLoading(false)
    }
  }

  const loginForm = (
    <Form name="login" onFinish={onLogin} size="large" layout="vertical">
      <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
        <Input prefix={<UserOutlined />} placeholder="用户名" />
      </Form.Item>
      <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          登录
        </Button>
      </Form.Item>
    </Form>
  )

  const registerForm = (
    <Form name="register" onFinish={onRegister} size="large" layout="vertical">
      <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
        <Input prefix={<UserOutlined />} placeholder="用户名" />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少6位' },
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
      </Form.Item>
      <Form.Item
        name="confirm"
        dependencies={['password']}
        rules={[
          { required: true, message: '请确认密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve()
              }
              return Promise.reject(new Error('两次密码不一致'))
            },
          }),
        ]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading} block>
          注册
        </Button>
      </Form.Item>
    </Form>
  )

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #e4ecf7 100%)',
        padding: 24,
      }}
    >
      <Card style={{ width: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 8 }}>
            FastAPI 演示
          </Title>
          <Paragraph type="secondary">登录 → 配置设置 → AI 流式对话</Paragraph>
        </div>
        <Tabs
          items={[
            { key: 'login', label: '登录', children: loginForm },
            { key: 'register', label: '注册', children: registerForm },
          ]}
        />
      </Card>
    </div>
  )
}
