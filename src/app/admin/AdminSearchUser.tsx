'use client';

import { useState, useTransition, useCallback } from 'react';
import { searchUser, grantAccess, type UserSearchResult } from './actions';
import styles from './admin.module.css';
import { Search, Loader2 } from 'lucide-react';

interface AdminSearchUserProps {
    onGrantSuccess: () => void;
}

export default function AdminSearchUser({ onGrantSuccess }: AdminSearchUserProps) {
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResult, setSearchResult] = useState<UserSearchResult | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [isSearching, startSearchTransition] = useTransition();

    const [paymentMethod, setPaymentMethod] = useState<'easypaisa' | 'bank' | 'other'>('easypaisa');
    const [notes, setNotes] = useState('');
    const [grantMessage, setGrantMessage] = useState('');
    const [isGranting, startGrantTransition] = useTransition();

    const handleSearch = useCallback(() => {
        if (!searchEmail.trim()) return;
        setSearchResult(null);
        setNotFound(false);
        setGrantMessage('');

        startSearchTransition(async () => {
            const result = await searchUser(searchEmail);
            if (result.found) {
                setSearchResult(result.user);
                setNotFound(false);
            } else {
                setSearchResult(null);
                setNotFound(true);
            }
        });
    }, [searchEmail]);

    const handleGrant = useCallback(() => {
        if (!searchResult) return;
        setGrantMessage('');

        startGrantTransition(async () => {
            const result = await grantAccess(
                searchResult.id,
                searchResult.discipline,
                paymentMethod,
                notes
            );

            if (result.success) {
                setGrantMessage('✅ Access granted successfully.');
                const refreshed = await searchUser(searchResult.email);
                if (refreshed.found) setSearchResult(refreshed.user);
                onGrantSuccess();
            } else {
                setGrantMessage(`❌ Error: ${result.error}`);
            }
        });
    }, [searchResult, paymentMethod, notes, onGrantSuccess]);

    return (
        <section className={styles.searchSection}>
            <h2 className={styles.sectionTitle}>User Search</h2>
            <form
                className={styles.searchForm}
                onSubmit={(e) => {
                    e.preventDefault();
                    handleSearch();
                }}
            >
                <div className={styles.searchInputWrapper}>
                    <Search size={18} className={styles.searchIcon} />
                    <input
                        type="email"
                        placeholder="Search by email"
                        value={searchEmail}
                        onChange={(e) => setSearchEmail(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>
                <button type="submit" className={styles.searchBtn} disabled={isSearching}>
                    {isSearching ? <Loader2 size={16} className={styles.spin} /> : 'Search'}
                </button>
            </form>

            {notFound && (
                <div className={styles.resultCard}>
                    <p className={styles.notFound}>No user found with that email.</p>
                </div>
            )}

            {searchResult && (
                <div className={styles.resultCard}>
                    <div className={styles.resultGrid}>
                        <div className={styles.resultField}>
                            <span className={styles.resultLabel}>Email</span>
                            <span className={styles.resultValue}>{searchResult.email}</span>
                        </div>
                        <div className={styles.resultField}>
                            <span className={styles.resultLabel}>Discipline</span>
                            <span className={styles.resultValue}>
                                {searchResult.discipline.toUpperCase()}
                            </span>
                        </div>
                        <div className={styles.resultField}>
                            <span className={styles.resultLabel}>Trial Used</span>
                            <span className={styles.resultValue}>
                                {searchResult.trialUsed ? 'Yes' : 'No'}
                            </span>
                        </div>
                        <div className={styles.resultField}>
                            <span className={styles.resultLabel}>Purchase Status</span>
                            <span
                                className={
                                    searchResult.purchaseStatus === 'active'
                                        ? styles.badgeActive
                                        : styles.badgeNone
                                }
                            >
                                {searchResult.purchaseStatus === 'active' ? 'Active' : 'None'}
                            </span>
                        </div>
                    </div>

                    {searchResult.purchaseStatus === 'none' && (
                        <div className={styles.grantPanel}>
                            <h3 className={styles.grantTitle}>Grant Full Access</h3>
                            <div className={styles.grantForm}>
                                <div className={styles.grantField}>
                                    <label htmlFor="paymentMethod">Payment Method</label>
                                    <select
                                        id="paymentMethod"
                                        value={paymentMethod}
                                        onChange={(e) =>
                                            setPaymentMethod(
                                                e.target.value as 'easypaisa' | 'bank' | 'other'
                                            )
                                        }
                                        className={styles.selectInput}
                                    >
                                        <option value="easypaisa">EasyPaisa</option>
                                        <option value="bank">Bank Transfer</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                                <div className={styles.grantField}>
                                    <label htmlFor="notes">Notes (optional)</label>
                                    <textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="e.g. WhatsApp verified, screenshot received"
                                        className={styles.textareaInput}
                                        rows={2}
                                    />
                                </div>
                                <button
                                    type="button"
                                    className={styles.grantBtn}
                                    onClick={handleGrant}
                                    disabled={isGranting}
                                >
                                    {isGranting ? (
                                        <Loader2 size={16} className={styles.spin} />
                                    ) : (
                                        'Grant Full Access'
                                    )}
                                </button>
                            </div>
                            {grantMessage && (
                                <p className={styles.grantMessage}>{grantMessage}</p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </section>
    );
}
