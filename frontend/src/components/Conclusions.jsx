import React, { useState, useEffect, useContext, useCallback } from "react";
import conclusionsData from "../conclusionsData";
// import colorMapping from "../colorMapping"; // For local deployment
import colorMapping from "../colormapping"; // For Netlify deployment
import Conclusion from "./Conclusion";
import { UserContext } from '../UserContext';
import footprintSvg from '../assets/footprint.svg';
import '../App.css';
const backendUrl = import.meta.env.VITE_APP_CLIENT_BACKEND_URL;

const Conclusions = ({ fetchAchievements }) => {
    const { user, setRandomizerFunction } = useContext(UserContext);
    const [highlightedIndex, setHighlightedIndex] = useState(null);
    const [randomIndex, setRandomIndex] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let interval;
        if (highlightedIndex !== null) {
            interval = setInterval(() => {
                const randomIndex = Math.floor(Math.random() * Object.keys(conclusionsData).length);
                setHighlightedIndex(randomIndex);
            }, 200);
        }
        return () => clearInterval(interval);
    }, [highlightedIndex]);

    const startRandomizer = useCallback(() => {
        console.log("startRandomizer called by user:", user); // Debug log
        setRandomIndex(null);
        setHighlightedIndex(5);
        setTimeout(() => {
            const finalRandomIndex = Math.floor(Math.random() * Object.keys(conclusionsData).length);
            setRandomIndex(finalRandomIndex);
            setHighlightedIndex(null);

            if (user) {
                const conclusionId = Object.keys(conclusionsData)[finalRandomIndex];
                updateUserConclusion(user._id, conclusionId);
                console.log(`The user Jumping to Conclusions is: ${user._id}`);
                console.log(`Sending POST request with conclusionId: ${conclusionId}`);
            } else {
                console.error("User is not defined");
            }
        }, 2300);
    }, [user]);

    const updateUserConclusion = async (userId, conclusionId) => {
        try {
            const response = await fetch(`${backendUrl}/user/${user._id}/conclusion`, {
            // const response = await fetch(`http://localhost:3000/user/${userId}/conclusion`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify({ conclusionId }),
            });
            if (!response.ok) {
                throw new Error('Failed to update conclusion');
            }
            const data = await response.json();
            if (fetchAchievements) {
                fetchAchievements();
            } else {
                console.error("fetchAchievements is not defined");
            }
        } catch (error) {
            console.error("Error updating conclusion:", error);
            setError('Failed to update conclusion. Please try again.');
        }
    };

    useEffect(() => {
        console.log("Setting randomizer function in Conclusions"); // Debug log
        setRandomizerFunction(() => startRandomizer);
    }, [setRandomizerFunction, startRandomizer]); 

    const handleClick = () => {
        if (typeof startRandomizer === 'function') {
            startRandomizer();
        } else {
            console.error('startRandomizer is not a function');
        }
    };

    return (
        <div className="p-1 flex flex-col min-h-screen">
            <div className="jump-to-text text-center mt-20 mb-1">
                <h2 className="text-4xl jersey-15-regular mt-8 mb-5" style={{ marginBottom: '-30px', marginTop: '68px' }}>Jump!</h2>
                <h2 className="text-3xl jersey-15-regular mt-8 mb-5" style={{ marginBottom: '-30px' }}>to</h2>
                <h2 className="text-4xl jersey-15-regular mt-8 mb-5" style={{ marginBottom: '25px' }}>Conclusions!</h2>
            </div>


            {error && <div className="text-red-500">{error}</div>}

            <div className="grid grid-cols-3 gap-4">
                {Object.keys(conclusionsData).map((key, index) => {
                    const conclusion = conclusionsData[key];
                    const colorClass = colorMapping[key];
                    return (
                        <div key={index} className={`${colorClass} ${highlightedIndex === index ? 'highlighted' : ''} ${randomIndex === index ? 'selected' : ''}`}>
                            <Conclusion conclusion={conclusion} />
                        </div>
                    );
                })}
            </div>



            <div className="p-1">
                <div className="start-line-text">
                <h2 className="text-3xl jersey-15-regular mt-8 mb-5" style={{ marginBottom: '0px', marginTop: '20px' }}>---------------------------</h2>
                <h2 className="text-4xl jersey-15-regular mt-8 mb-5" style={{ marginBottom: '0px', marginTop: '0px' }}>START</h2>
                </div>
            </div>



            <footer className="footer mt-auto">
                <button className="footprint-button" onClick={handleClick}>
                    <img src={footprintSvg} alt="Footprint" className="footprint-icon" />
                </button>
            </footer>

            <style>{`
                .highlighted {
                    border: 4px solid yellow;
                }
                .selected {
                    border: 4px solid red;
                }
            `}</style>
        </div>
    );
};

export default Conclusions;
