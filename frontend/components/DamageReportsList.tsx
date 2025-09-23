'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { List, Badge, Card, Typography, Avatar, Spin, Alert } from 'antd';
import { UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { DamageReportListDto, AccidentType } from '../types/damage-reports';

const { Text } = Typography;

interface DamageReportsListProps {
  onSelectReport: (reportId: string) => void;
  selectedReportId: string | null;
}

const getAccidentTypeBadgeColor = (accidentType: AccidentType): string => {
  switch (accidentType) {
    case AccidentType.BreakDown:
      return 'orange';
    case AccidentType.CarAccident:
      return 'red';
    case AccidentType.VehicleTheft:
      return 'purple';
    case AccidentType.SomethingElse:
      return 'blue';
    default:
      return 'default';
  }
};

const getAccidentTypeDisplayName = (accidentType: AccidentType): string => {
  switch (accidentType) {
    case AccidentType.BreakDown:
      return 'Break Down';
    case AccidentType.CarAccident:
      return 'Car Accident';
    case AccidentType.VehicleTheft:
      return 'Vehicle Theft';
    case AccidentType.SomethingElse:
      return 'Something Else';
    default:
      return accidentType;
  }
};

export const DamageReportsList: React.FC<DamageReportsListProps> = ({
  onSelectReport,
  selectedReportId
}) => {
  const [reports, setReports] = useState<DamageReportListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [skip, setSkip] = useState(0);
  const pageSize = 10;
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchReports = async (skipCount: number, isLoadingMore = false) => {
    try {
      if (isLoadingMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }
      setError(null);
      
      const response = await fetch(`/api/damage-reports?skip=${skipCount}&take=${pageSize}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch reports: ${response.status} ${response.statusText}`);
      }
      
      const data: DamageReportListDto[] = await response.json();
      
      if (isLoadingMore) {
        setReports(prev => [...prev, ...data]);
      } else {
        setReports(data);
      }
      
      // If we got fewer items than requested, we've reached the end
      setHasMore(data.length === pageSize);
      setSkip(skipCount + data.length);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load more data when scrolling near bottom
  const handleScroll = useCallback(() => {
    if (!scrollContainerRef.current || loadingMore || !hasMore) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Load more when scrolled 80% of the way down
    if (scrollPercentage > 0.8) {
      fetchReports(skip, true);
    }
  }, [skip, loadingMore, hasMore]);

  useEffect(() => {
    fetchReports(0);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (error) {
    return (
      <Alert
        message="Error Loading Reports"
        description={error}
        type="error"
        showIcon
        style={{ margin: 16 }}
      />
    );
  }

  return (
    <Card 
      title="Damage Reports" 
      style={{ height: '100%' }}
      styles={{
        body: { padding: 0, height: 'calc(100% - 57px)', display: 'flex', flexDirection: 'column' }
      }}
    >
      <div 
        ref={scrollContainerRef}
        style={{ flex: 1, overflow: 'auto' }}
      >
        <Spin spinning={loading}>
          <List
            dataSource={reports}
            renderItem={(report) => (
              <List.Item
                key={report.id}
                onClick={() => onSelectReport(report.id)}
                style={{
                  cursor: 'pointer',
                  backgroundColor: selectedReportId === report.id ? '#f0f8ff' : 'transparent',
                  borderLeft: selectedReportId === report.id ? '4px solid #1890ff' : '4px solid transparent',
                  padding: '16px 24px'
                }}
                className="damage-report-list-item"
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text strong>{`${report.firstName} ${report.lastName}`}</Text>
                      <Badge 
                        color={getAccidentTypeBadgeColor(report.accidentType)}
                        text={getAccidentTypeDisplayName(report.accidentType)}
                      />
                    </div>
                  }
                  description={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CalendarOutlined />
                      <Text type="secondary">
                        {formatDate(report.dateOfAccidentUtc)}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </Spin>
        
        {/* Loading indicator for infinite scroll */}
        {loadingMore && (
          <div style={{ textAlign: 'center', padding: '16px' }}>
            <Spin size="small" />
            <Text type="secondary" style={{ marginLeft: 8 }}>Loading more reports...</Text>
          </div>
        )}
        
        {/* End of data indicator */}
        {!hasMore && reports.length > 0 && (
          <div style={{ textAlign: 'center', padding: '16px', color: '#999' }}>
            <Text type="secondary">No more reports to load</Text>
          </div>
        )}
      </div>
    </Card>
  );
};
