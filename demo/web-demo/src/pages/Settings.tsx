import { Layout, Button, Typography } from 'antd'
import {
  LogoutOutlined,
  MessageOutlined,
  SettingOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import SystemSettings from '../components/SystemSettings'

const { Header, Content } = Layout
const { Title, Paragraph } = Typography

export default function Settings() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#001529',
          padding: '0 24px',
        }}
      >
        <div style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <SettingOutlined />
          <span>系统设置</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="primary"
            icon={<MessageOutlined />}
            onClick={() => navigate('/chat')}
          >
            进入 AI 对话
          </Button>
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            style={{ color: '#fff' }}
          >
            退出
          </Button>
        </div>
      </Header>
      <Content style={{ padding: 24, maxWidth: 960, margin: '0 auto', width: '100%' }}>
        <Title level={4}>配置 AI 服务</Title>
        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          请先填写 AI 配置（API Key、Base URL、Model），保存后再进入对话页面。
        </Paragraph>
        <SystemSettings />
      </Content>
    </Layout>
  )
}
