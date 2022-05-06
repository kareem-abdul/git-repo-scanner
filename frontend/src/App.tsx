import React, { useState } from 'react';
import './App.css';



import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { NavigateSetter } from './navigateSetter';
import { Repositorylist } from './pages/repositorylist';
import { RepositoryDetails } from './pages/repositoryDetails';

const  App = ()=> {
  
  return (
    <>
     <BrowserRouter>
        <NavigateSetter />
        <Routes>
         <Route index element={<Repositorylist />} />
         <Route path="/" element={<Repositorylist />} />
         <Route path="/repository-details" element={<RepositoryDetails />} />
        </Routes>
     </BrowserRouter>
    </>
  );
}

export default App;
