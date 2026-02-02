import React from 'react';
import './BookDetailsModal.css'; // Reuse existing modal styles

const AnswerModal = ({ isOpen, onClose, question, answer, loading }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto' }}>
                <button className="close-btn" onClick={onClose} style={{ top: '10px', right: '10px', fontSize: '1.5rem' }}>&times;</button>

                <h2 style={{ marginBottom: '15px' }}>AI Answer</h2>

                <div className="question-text" style={{ fontWeight: 'bold', marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
                    {question}
                </div>

                <div className="answer-content">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>
                            <div className="spinner" style={{
                                border: '4px solid rgba(0, 0, 0, 0.1)',
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                borderLeftColor: '#09f',
                                animation: 'spin 1s ease infinite',
                                margin: '0 auto 10px'
                            }}></div>
                            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                            <p>Generating answer...</p>
                        </div>
                    ) : (
                        <div style={{ lineHeight: '1.6' }}>
                            {answer ? (
                                answer.split('\n').map((para, i) => <p key={i} style={{ marginBottom: '10px' }}>{para}</p>)
                            ) : (
                                <p>No answer available.</p>
                            )}
                        </div>
                    )}
                </div>

                <div style={{ marginTop: '20px', textAlign: 'right' }}>
                    <button onClick={onClose} className="download-btn" >Close</button>
                </div>
            </div>
        </div>
    );
};

export default AnswerModal;
