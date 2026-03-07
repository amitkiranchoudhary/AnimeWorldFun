import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import './FeedbackSection.css';

const feedbackStates = [
    {
        bgColor: '#1a0a2e',
        eyeWidth: 50, eyeHeight: 50, eyeRadius: '100%', eyeColor: '#ff4757',
        smileRotate: 180,
        noteText: 'BAD',
        noteColor: '#ff4757',
        indicatorLeft: '0%',
        emoji: '😞'
    },
    {
        bgColor: '#1a1a3e',
        eyeWidth: 70, eyeHeight: 16, eyeRadius: '36px', eyeColor: '#ffa502',
        smileRotate: 180,
        noteText: 'NOT BAD',
        noteColor: '#ffa502',
        indicatorLeft: '50%',
        emoji: '😐'
    },
    {
        bgColor: '#0a2e1a',
        eyeWidth: 60, eyeHeight: 60, eyeRadius: '100%', eyeColor: '#2ed573',
        smileRotate: 0,
        noteText: 'SUGOI!',
        noteColor: '#2ed573',
        indicatorLeft: '100%',
        emoji: '🤩'
    },
];

const spring = { type: 'spring', stiffness: 300, damping: 30 };

export default function FeedbackSection() {
    const [selected, setSelected] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const current = feedbackStates[selected];

    const handleSubmit = () => {
        setSubmitted(true);
        setTimeout(() => setSubmitted(false), 3000);
    };

    return (
        <motion.section
            className="feedback-section"
            animate={{ backgroundColor: current.bgColor }}
            transition={spring}
        >
            <div className="feedback-section__inner">
                <h3 className="feedback-section__title">
                    How was your experience? ✨
                </h3>

                {/* Face */}
                <div className="feedback-section__face">
                    <div className="feedback-section__eyes">
                        <motion.div
                            className="feedback-section__eye"
                            animate={{
                                width: current.eyeWidth,
                                height: current.eyeHeight,
                                borderRadius: current.eyeRadius,
                                backgroundColor: current.eyeColor
                            }}
                            transition={spring}
                        />
                        <motion.div
                            className="feedback-section__eye"
                            animate={{
                                width: current.eyeWidth,
                                height: current.eyeHeight,
                                borderRadius: current.eyeRadius,
                                backgroundColor: current.eyeColor
                            }}
                            transition={spring}
                        />
                    </div>
                    <motion.div
                        className="feedback-section__smile"
                        animate={{ rotate: current.smileRotate }}
                        transition={spring}
                    >
                        <svg width="60" height="30" viewBox="0 0 100 60" fill="none">
                            <motion.path
                                d="M10 30 Q50 70 90 30"
                                strokeWidth="12"
                                strokeLinecap="round"
                                animate={{ stroke: current.eyeColor }}
                                transition={spring}
                            />
                        </svg>
                    </motion.div>
                </div>

                {/* Rating text */}
                <motion.div
                    className="feedback-section__note"
                    animate={{ color: current.noteColor }}
                    transition={spring}
                >
                    {current.emoji} {current.noteText}
                </motion.div>

                {/* Slider track */}
                <div className="feedback-section__track">
                    <div className="feedback-section__track-line" />
                    {feedbackStates.map((_, i) => (
                        <button
                            key={i}
                            className={`feedback-section__dot ${selected === i ? 'feedback-section__dot--active' : ''}`}
                            onClick={() => setSelected(i)}
                        />
                    ))}
                    <motion.div
                        className="feedback-section__indicator"
                        animate={{ left: current.indicatorLeft }}
                        transition={spring}
                    />
                </div>

                {/* Labels */}
                <div className="feedback-section__labels">
                    {['Bad', 'Not Bad', 'Sugoi!'].map((text, i) => (
                        <span
                            key={text}
                            className={`feedback-section__label ${selected === i ? 'feedback-section__label--active' : ''}`}
                        >
                            {text}
                        </span>
                    ))}
                </div>

                {/* Submit */}
                <button
                    className="feedback-section__submit"
                    onClick={handleSubmit}
                    disabled={submitted}
                >
                    {submitted ? 'Arigatou! 🙏' : 'Send Feedback'}
                </button>
            </div>
        </motion.section>
    );
}
