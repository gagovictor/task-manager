import { Middleware } from 'redux';
import { isPending, isRejected, isFulfilled } from '@reduxjs/toolkit';
import { startLoading, finishLoading } from './loadingSlice';

const loadingMiddleware: Middleware = (store) => (next) => (action) => {
  if (isPending(action)) {
    store.dispatch(startLoading());
  } else if (isFulfilled(action) || isRejected(action)) {
    store.dispatch(finishLoading());
  }
  return next(action);
};

export default loadingMiddleware;
