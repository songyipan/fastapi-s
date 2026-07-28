import { useCallback, useEffect, useState } from 'react'
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  Spin,
  Typography,
  App,
} from 'antd'
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons'
import {
  getSettings,
  updateSettings,
  type SettingGroupResponse,
} from '../services/api'

const { Text, Title } = Typography

export default function SystemSettings() {
  const [groups, setGroups] = useState<SettingGroupResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const { message } = App.useApp()

  const fetchSettings = useCallback(async () => {
    setLoading(true)
    try {
      const json = await getSettings()
      if (json.code === '0') {
        setGroups(json.data)
        const values: Record<string, string> = {}
        for (const group of json.data) {
          for (const item of group.settings) {
            values[item.key] = item.value
          }
        }
        form.setFieldsValue(values)
      } else {
        message.error(json.message || '获取设置失败')
      }
    } catch {
      message.error('网络错误，请稍后重试')
    } finally {
      setLoading(false)
    }
  }, [form, message])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const onSave = useCallback(async () => {
    const values = form.getFieldsValue()
    const items = Object.entries(values).map(([key, value]) => ({
      key,
      value: String(value ?? ''),
    }))

    setSaving(true)
    try {
      const json = await updateSettings(items)
      if (json.code === '0') {
        message.success('设置保存成功')
      } else {
        message.error(json.message || '保存失败')
      }
    } catch {
      message.error('网络错误，请稍后重试')
    } finally {
      setSaving(false)
    }
  }, [form, message])

  return (
    <Spin spinning={loading}>
      <Space style={{ width: '100%', justifyContent: 'flex-end', marginBottom: 16 }}>
        <Button icon={<ReloadOutlined />} onClick={fetchSettings}>
          刷新
        </Button>
        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={onSave}>
          保存设置
        </Button>
      </Space>

      <Form form={form} layout="vertical" style={{ maxWidth: 720 }}>
        {groups.map((group) => (
          <Card
            key={group.key}
            title={
              <Space direction="vertical" size={0}>
                <Title level={5} style={{ margin: 0 }}>
                  {group.display_name}
                </Title>
                <Text type="secondary">{group.description}</Text>
              </Space>
            }
            style={{ marginBottom: 16 }}
          >
            {group.settings.map((item) => (
              <Form.Item
                key={item.key}
                name={item.key}
                label={item.display_name}
                help={item.description}
              >
                <Input placeholder={`请填写 ${item.display_name}`} />
              </Form.Item>
            ))}
          </Card>
        ))}
      </Form>

      {groups.length === 0 && !loading && (
        <Text type="secondary" style={{ display: 'block', textAlign: 'center' }}>
          暂无可用的系统设置
        </Text>
      )}
    </Spin>
  )
}
