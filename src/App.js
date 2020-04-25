import React from 'react';
import './App.css';
import Header from './components/header';
import SearchBar from './components/searchbar';
import SearchTable from './components/searchresults'

function App() {
  return (
    <div className="App">
      <Header />
      <SearchBar />
      <SearchTable />
    </div>
  );
}

export default App;
