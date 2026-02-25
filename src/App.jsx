import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Order from './pages/Order';
import OrderManager from './pages/OrderManager';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/orden" element={<Order />} />
        <Route path="/pedido/:token" element={<OrderManager />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
