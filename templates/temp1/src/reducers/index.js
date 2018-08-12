import { combineReducers } from 'redux';
import { HomeReducer } from './home/home.reducer';

export const Reducers = combineReducers(
  {
    home: HomeReducer
  }
);