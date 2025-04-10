
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <p className="text-xl mb-8">页面未找到</p>
      <Button asChild>
        <Link to="/">返回仪表盘</Link>
      </Button>
    </div>
  );
};

export default NotFound;
