import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const ViewSite = () => {
  const { storeId } = useParams();
  const [storeData, setStoreData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStore = async () => {
      try {
        const response = await fetch(`/api/store`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-store-id': storeId,
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        setStoreData(data);
      } catch (err) {
        console.error("Failed to fetch store:", err);
        setError('Failed to load store');
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeId]);

  if (loading) return <div>Loading your store...</div>;
  if (error) return <div>{error}</div>;
  if (!storeData) return <div>No store data found.</div>;

  const { business, products, customize } = storeData;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '20px' }}>
      <header style={{ borderBottom: '1px solid #ccc', marginBottom: '20px' }}>
        <h1>{business?.name || "Business Name"}</h1>
        <p>{business?.description}</p>
      </header>

      <section>
        <h2>Products</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {(products || []).map(product => (
            <div key={product._id} style={{ border: '1px solid #ddd', padding: '10px', width: '200px' }}>
              <img
                src={product.images?.[0] || 'https://via.placeholder.com/150'}
                alt={product.name}
                style={{ width: '100%', height: '150px', objectFit: 'cover' }}
              />
              <h3>{product.name}</h3>
              <p>₹{product.price}</p>
              <p>{product.description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ marginTop: '40px', borderTop: '1px solid #ccc', paddingTop: '10px' }}>
        <p>Contact: {business?.email || "your@email.com"}</p>
        <p>Address: {business?.address || "Your business address"}</p>
      </footer>
    </div>
  );
};

export default ViewSite;