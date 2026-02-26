// ============================================
// FILE: src/components/common/PageLoader.jsx
// ============================================
// Usage:
//   import { PageLoader, PageError } from '../../components/common/PageLoader';
//   if (loading) return <PageLoader />;
//   if (error)   return <PageError message={error} onRetry={fetchData} />;

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ORANGE = '#FF6B1A';

const keyframes = `
@keyframes pl-spin { to { transform: rotate(360deg); } }
@keyframes pl-bar  { 0%,100% { transform: scaleY(0.35); opacity:0.5; }
                     50%     { transform: scaleY(1);    opacity:1;   } }
`;

// Full-area loader (min-h 60vh)
export function PageLoader({ text = 'Loading...' }) {
  return (
    <>
      <style>{keyframes}</style>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
        justifyContent:'center', minHeight:'60vh', gap:20, userSelect:'none' }}>

        {/* Spinner ring */}
        <div style={{ position:'relative', width:52, height:52 }}>
          <span style={{ position:'absolute', inset:0, borderRadius:'50%',
            border:'4px solid #F3F4F6' }} />
          <span style={{ position:'absolute', inset:0, borderRadius:'50%',
            border:'4px solid transparent',
            borderTopColor:ORANGE, borderRightColor:ORANGE,
            animation:'pl-spin 0.8s linear infinite' }} />
        </div>

        {/* Wave bars */}
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          {[0, 0.1, 0.2, 0.1, 0].map((delay, i) => (
            <span key={i} style={{ display:'inline-block', width:4, height:18,
              borderRadius:4, background: i===2 ? ORANGE : '#FDBA74',
              animation:`pl-bar 1s ease-in-out ${delay}s infinite` }} />
          ))}
        </div>

        {/* Label */}
        <p style={{ margin:0, fontSize:13, fontWeight:500, color:'#9CA3AF',
          letterSpacing:'0.04em' }}>
          {text}
        </p>
      </div>
    </>
  );
}

// Full-area error card
export function PageError({ message = 'Something went wrong', onRetry }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center',
      justifyContent:'center', minHeight:'60vh', gap:16, padding:'0 16px' }}>

      <div style={{ width:56, height:56, borderRadius:16,
        background:'#FEF2F2', border:'1.5px solid #FECACA',
        display:'flex', alignItems:'center', justifyContent:'center' }}>
        <AlertCircle style={{ width:26, height:26, color:'#EF4444' }} />
      </div>

      <div style={{ textAlign:'center', maxWidth:280 }}>
        <p style={{ margin:'0 0 4px', fontWeight:600, color:'#1F2937', fontSize:14 }}>
          Failed to load
        </p>
        <p style={{ margin:0, fontSize:12, color:'#9CA3AF', lineHeight:1.6 }}>
          {message}
        </p>
      </div>

      {onRetry && (
        <button onClick={onRetry}
          style={{ display:'flex', alignItems:'center', gap:6,
            padding:'8px 18px', fontSize:13, fontWeight:600,
            background:ORANGE, color:'#fff',
            border:'none', borderRadius:10, cursor:'pointer' }}
          onMouseEnter={e => e.currentTarget.style.opacity='0.88'}
          onMouseLeave={e => e.currentTarget.style.opacity='1'}>
          <RefreshCw style={{ width:14, height:14 }} />
          Try Again
        </button>
      )}
    </div>
  );
}

export default PageLoader;