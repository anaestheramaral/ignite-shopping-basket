import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem("@RocketShoes:cart")

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      // TODO
      const updatedCart = [...cart]
      const product = updatedCart.find(item => item.id === productId)
      const stock = await api.get(`/stock/${productId}`)
      const stockAmount = stock.data.amount
      const currentAmount = product? product.amount : 0

      const updatedAmount = currentAmount + 1;
      
      if (updatedAmount > stockAmount){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      } 

      if (product){
        product.amount = updatedAmount
        setCart(updatedCart)
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart))
      } else {
        const product = await api.get(`products/${productId}`);
        const productAmount = {...product.data, amount: 1};
        updatedCart.push(productAmount);

        setCart(updatedCart)
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart))
      }

      
    }
     catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {
      // TODO
        const product = cart.find(item => item.id === productId);
        if (product) {
          const updatedCart = cart.filter(item => item.id!== productId)
          setCart(updatedCart)
          localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart))
        }
        else {
          toast.error('Erro na remoção do produto');
        }

    } catch {
      // TODO
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      // TODO
      const updatedCart = [...cart]
      const product = cart.find(item => item.id === productId);
      const stock = await api.get(`/stock/${productId}`);

      const stockAmount = stock.data.amount;

      if(amount <= 0 ){
        return;
      }

      if (amount > stockAmount){
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      if (product){
        product.amount = amount
        setCart(updatedCart)
        localStorage.setItem("@RocketShoes:cart", JSON.stringify(updatedCart))
      }


    } catch {
      // TODO
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
