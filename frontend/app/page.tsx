
'use client';

import React, { useState } from 'react';
import { Layout, Row, Col, Button } from 'antd';
import { CarOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { DamageReportsList } from '../components/DamageReportsList';
import { DamageReportDetails } from '../components/DamageReportDetails';

const { Header, Content } = Layout;

export default function Home() {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const router = useRouter();

  const handleSelectReport = (reportId: string) => {
    setSelectedReportId(reportId);
  };

  const handleCreateReport = () => {
    router.push('/create-report');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#001529'
      }}>
        <div style={{ color: 'white', fontSize: '20px', fontWeight: 'bold' }}>
          <CarOutlined style={{ marginRight: '8px' }} />
          Car Damage Report System
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          size="large"
          onClick={handleCreateReport}
        >
          Create Report
        </Button>
      </Header>
      
      <Content style={{ padding: '24px', background: '#f0f2f5' }}>
        <Row gutter={24} style={{ height: 'calc(100vh - 112px)' }}>
          <Col span={10}>
            <DamageReportsList 
              onSelectReport={handleSelectReport}
              selectedReportId={selectedReportId}
            />
          </Col>
          <Col span={14}>
            <DamageReportDetails reportId={selectedReportId} />
          </Col>
        </Row>
      </Content>
    </Layout>
  );
}
