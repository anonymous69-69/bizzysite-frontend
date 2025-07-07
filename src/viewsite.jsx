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
        const response = await fetch('/api/store', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-store-id': storeId,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch store: ${response.statusText}`);
        }

        const data = await response.json();
        setStoreData(data);
      } catch (err) {
        console.error('Error fetching store:', err);
        setError('Unable to load store');
      } finally {
        setLoading(false);
      }
    };

    fetchStore();
  }, [storeId]);

  if (loading) return <div style={{ padding: '2rem' }}>Loading your store...</div>;
  if (error) return <div style={{ padding: '2rem', color: 'red' }}>{error}</div>;
  if (!storeData) return <div style={{ padding: '2rem' }}>No store found.</div>;

  const { business, products = [], customize = {} } = storeData;

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', backgroundColor: customize?.backgroundColor || '#fff' }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: customize?.primaryColor || 'black' }}>
          {business?.name || 'Your Business'}
        </h1>
        <p style={{ fontSize: '1rem', color: '#666' }}>{business?.description || 'No description yet.'}</p>
      </header>

      {/* Product List */}
      <section>
        <h2 style={{ marginBottom: '1rem' }}>Products</h2>
        {products.length === 0 ? (
          <p>No products available yet.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
            {products.map((product) => (
              <div
                key={product._id}
                style={{
                  width: '220px',
                  border: '1px solid #ddd',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
              >
                <img
                  src={product.images?.[0] || 'https://via.placeholder.com/220'}
                  alt={product.name}
                  style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                />
                <div style={{ padding: '10px' }}>
                  <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px' }}>{product.name}</h3>
                  <p style={{ fontWeight: 'bold', color: customize?.secondaryColor || '#000' }}>
                    ₹{product.price}
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#666' }}>
                    {product.description || 'No description'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ marginTop: '4rem', borderTop: '1px solid #ccc', paddingTop: '1rem', fontSize: '0.9rem' }}>
        <p>Contact: {business?.email || 'your@email.com'}</p>
        <p>Address: {business?.address || 'Business address'}</p>
      </footer>
    </div>
  );
};

export default ViewSite;