import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route } from 'react-router-dom';
import { ArticleList, ArticleCreate } from './whiteboard-component';
import { Alert, NavPageHeader } from './widgets';

let root = document.getElementById('root');
if (root)
  createRoot(root).render(
    <HashRouter>
      <>
        <Alert />
        <NavPageHeader />
        <ArticleList />
      </>
    </HashRouter>,
  );
