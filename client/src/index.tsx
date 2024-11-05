import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { ArticleList } from './whiteboard-component';
import { Alert, Card, Row, Column } from './widgets';

let root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <>
      <Alert />
      <Card title="Wiki-side">
        <Row>
          <Column>Articles</Column>
          <Column>Tags</Column>
          <Column>About</Column>
        </Row>
        <ArticleList />
      </Card>
    </>,
  );
