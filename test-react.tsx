import React, { useState, useEffect } from 'react';

export default function TestReact() {
  const [test, setTest] = useState(false);
  
  useEffect(() => {
    console.log('test');
  }, []);

  return null;
}
