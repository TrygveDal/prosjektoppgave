import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { ArticleList } from './whiteboard-component';
import { Alert, NavPageHeader } from './widgets';

let root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <>
      <Alert />
      <NavPageHeader />
      <ArticleList />
    </>,
  );
