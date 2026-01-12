import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './ExamDropdown.module.css';

interface Exam {
    id: string;
    title: string;
    is_trial: boolean;
}

interface ExamDropdownProps {
    currentExamId: string;
    exams: Exam[];
}

export const ExamDropdown = ({ currentExamId, exams }: ExamDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentExam = exams.find(e => e.id === currentExamId);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExamSelect = (examId: string) => {
        if (examId !== currentExamId) {
            router.push(`/exam/${examId}`);
        }
        setIsOpen(false);
    };

    return (
        <div className={styles.dropdown} ref={dropdownRef}>
            <button
                className={styles.trigger}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <span>{currentExam?.title || 'Select Exam'}</span>
                <ChevronDown size={20} className={isOpen ? styles.iconOpen : ''} />
            </button>

            {isOpen && (
                <div className={styles.menu}>
                    {exams.map((exam, index) => (
                        <button
                            key={exam.id}
                            className={`${styles.item} ${exam.id === currentExamId ? styles.active : ''}`}
                            onClick={() => handleExamSelect(exam.id)}
                            disabled={exam.id === currentExamId}
                            type="button"
                        >
                            <span className={styles.examNumber}>
                                {exam.is_trial ? 'Trial' : `Mock Exam ${index}`}
                            </span>
                            <span className={styles.examTitle}>{exam.title}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
