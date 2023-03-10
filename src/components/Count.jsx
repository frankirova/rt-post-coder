import { useState } from "react";

export const Count = ({ prod, addTo }) => {
  const [count, setCount] = useState(1);

  const increment = () => {
    if (count < prod.stock) {
      setCount(count + 1);
    }
  };
  const decrement = () => {
    if (count > 1) {
      setCount(count - 1);
    }
  };

  return (
    <section className="botones-product-detail d-flex">
      <button
        onClick={() => {
          addTo(count);
        }}
        className="cart-widget btn btn-success mx-2 my-auto d-flex justify-content-center align-items-center w-100"
      >
        Add to cart
      </button>

      <div className="d-flex align-items-center">
        <button onClick={() => increment()} className="m-4 btn btn-success">
          +
        </button>

        <span>{count}</span>

        <button onClick={() => decrement()} className="m-4 btn btn-success">
          -
        </button>
      </div>
    </section>
  );
};
