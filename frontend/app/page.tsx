
'use client';

import { Button, Card, Layout, Typography, Space } from 'antd';
import { CarOutlined, FormOutlined, FileTextOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center',
        background: '#001529'
      }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          <CarOutlined style={{ marginRight: '8px' }} />
          Car Damage Report System
        </div>
      </Header>
      
      <Content style={{ padding: '50px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <Title level={1}>Cloud Native meets AI</Title>
          <Paragraph style={{ fontSize: '18px', marginBottom: '40px' }}>
            AI-powered car damage report system with information extraction from text, speech, and images.
          </Paragraph>
          
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
              <Title level={3}>
                <FileTextOutlined style={{ marginRight: '8px' }} />
                Browse Reports
              </Title>
              <Paragraph>
                View and manage all existing car damage reports in a comprehensive master-detail view.
              </Paragraph>
              <Button type="primary" size="large">
                View All Reports
              </Button>
            </Card>
            
            <Card>
              <Title level={3}>
                <FormOutlined style={{ marginRight: '8px' }} />
                Create New Report
              </Title>
              <Paragraph>
                Start a new car damage report using our AI-assisted wizard that guides you through personal data, 
                accident circumstances, and vehicle damage assessment.
              </Paragraph>
              <Button type="primary" size="large">
                Start New Report
              </Button>
            </Card>
          </Space>
        </div>
      </Content>
    </Layout>
  );
}
