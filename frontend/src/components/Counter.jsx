import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Counter() {
  const [counter, setCounter] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    }
    getCounter();
  }, [navigate]);

  const getCounter = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/increment", {
        headers: {
          Authorization: token,
        },
      });
      setCounter(response.data.counter);
    } catch (error) {
      alert("Error incrementing counter");
      console.log(error);
    }
  };

  const handleIncrement = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/increment",
        {},
        {
          headers: {
            Authorization: token,
          },
        }
      );
      setCounter(response.data.counter);
    } catch (error) {
      alert("Error incrementing counter");
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div>
      <h2>Counter: {counter}</h2>
      <button onClick={handleIncrement}>Increment</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Counter;
