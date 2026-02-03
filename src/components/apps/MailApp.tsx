import { Mail, Inbox, Star, Send, Trash2, Clock, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Email {
    id: number;
    sender: string;
    senderEmail: string;
    subject: string;
    preview: string;
    timestamp: string;
    isRead: boolean;
    isStarred: boolean;
    hasAttachment: boolean;
}

const fakeEmails: Email[] = [
    {
        id: 1,
        sender: 'Tech Recruiter',
        senderEmail: 'recruiter@techcorp.com',
        subject: 'Senior Full Stack Developer Position',
        preview: 'Hi Kadir, We came across your profile and are impressed with your experience in Java/Spring Boot and React...',
        timestamp: '10:30 AM',
        isRead: false,
        isStarred: true,
        hasAttachment: false,
    },
    {
        id: 2,
        sender: 'GitHub',
        senderEmail: 'noreply@github.com',
        subject: 'Your pull request was merged',
        preview: 'kadiraydemir merged pull request #42 in kadiraydemir/portfolio-os...',
        timestamp: 'Yesterday',
        isRead: true,
        isStarred: false,
        hasAttachment: false,
    },
    {
        id: 3,
        sender: 'LinkedIn',
        senderEmail: 'notifications@linkedin.com',
        subject: 'You appeared in 15 searches this week',
        preview: 'Your profile is getting attention! See who viewed your profile and connect with them...',
        timestamp: '2 days ago',
        isRead: true,
        isStarred: false,
        hasAttachment: false,
    },
    {
        id: 4,
        sender: 'AWS',
        senderEmail: 'no-reply@aws.amazon.com',
        subject: 'Your monthly AWS bill is ready',
        preview: 'Your AWS bill for January 2026 is now available. Total: $45.32...',
        timestamp: '3 days ago',
        isRead: true,
        isStarred: false,
        hasAttachment: true,
    },
    {
        id: 5,
        sender: 'Stack Overflow',
        senderEmail: 'noreply@stackoverflow.com',
        subject: 'Your answer was accepted',
        preview: 'Congratulations! Your answer to "How to optimize React re-renders" was marked as accepted...',
        timestamp: '1 week ago',
        isRead: true,
        isStarred: true,
        hasAttachment: false,
    },
];

export const MailApp = () => {
    const [selectedEmail, setSelectedEmail] = useState<Email | null>(fakeEmails[0]);
    const { t } = useTranslation();

    const handleCompose = () => {
        // Open Gmail compose with pre-filled recipient
        window.open(
            'https://mail.google.com/mail/?view=cm&fs=1&to=mail@kadiraydemir.com.tr',
            '_blank'
        );
    };

    return (
        <div className="w-full h-full bg-white text-gray-800 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center justify-between shadow-md">
                <div className="flex items-center gap-3">
                    <Mail size={24} />
                    <h1 className="text-xl font-semibold">{t('mailApp.title')}</h1>
                </div>
                <button
                    onClick={handleCompose}
                    className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <Send size={18} />
                    {t('mailApp.compose')}
                </button>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <div className="w-48 bg-gray-50 border-r border-gray-200 p-3 space-y-1">
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-medium hover:bg-blue-200 transition-colors">
                        <Inbox size={18} />
                        <span>{t('mailApp.inbox')}</span>
                        <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {fakeEmails.filter(e => !e.isRead).length}
                        </span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                        <Star size={18} />
                        <span>{t('mailApp.starred')}</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                        <Send size={18} />
                        <span>{t('mailApp.sent')}</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors">
                        <Trash2 size={18} />
                        <span>{t('mailApp.trash')}</span>
                    </button>
                </div>

                {/* Email List */}
                <div className="flex-1 flex overflow-hidden">
                    {/* List View */}
                    <div className={`${selectedEmail ? 'w-1/3' : 'w-full'} border-r border-gray-200 overflow-y-auto`}>
                        {fakeEmails.map((email) => (
                            <div
                                key={email.id}
                                onClick={() => setSelectedEmail(email)}
                                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${!email.isRead ? 'bg-blue-50/50' : ''
                                    } ${selectedEmail?.id === email.id ? 'bg-blue-100' : ''}`}
                            >
                                <div className="flex items-start justify-between mb-1">
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                        {email.isStarred && (
                                            <Star size={14} className="text-yellow-500 fill-yellow-500 flex-shrink-0" />
                                        )}
                                        <span className={`font-semibold truncate ${!email.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {email.sender}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                                        {email.hasAttachment && (
                                            <Paperclip size={14} className="text-gray-400" />
                                        )}
                                        <span className="text-xs text-gray-500">{email.timestamp}</span>
                                    </div>
                                </div>
                                <div className={`text-sm mb-1 truncate ${!email.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                    {email.subject}
                                </div>
                                <div className="text-xs text-gray-500 truncate">
                                    {email.preview}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Email Detail View */}
                    {selectedEmail && (
                        <div className="flex-1 bg-white overflow-y-auto">
                            <div className="p-6">
                                {/* Email Header */}
                                <div className="border-b border-gray-200 pb-4 mb-4">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                        {selectedEmail.subject}
                                    </h2>
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="font-semibold text-gray-900">
                                                {selectedEmail.sender}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {selectedEmail.senderEmail}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock size={14} />
                                            <span>{selectedEmail.timestamp}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Email Body */}
                                <div className="text-gray-700 leading-relaxed space-y-4">
                                    <p>{selectedEmail.preview}</p>
                                    <p>
                                        {t('mailApp.demoMessage')}
                                    </p>
                                    <p className="text-sm text-gray-500 italic">
                                        {t('mailApp.demoNote')}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={handleCompose}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                    >
                                        <Send size={16} />
                                        {t('mailApp.replyGmail')}
                                    </button>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                        {t('mailApp.archive')}
                                    </button>
                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                        {t('mailApp.delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Empty State */}
                    {!selectedEmail && (
                        <div className="flex-1 flex items-center justify-center bg-gray-50">
                            <div className="text-center text-gray-400">
                                <Mail size={64} className="mx-auto mb-4 opacity-20" />
                                <p className="text-lg">{t('mailApp.selectEmail')}</p>
                                <p className="text-sm mt-2">{t('mailApp.or')}</p>
                                <button
                                    onClick={handleCompose}
                                    className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
                                >
                                    <Send size={18} />
                                    {t('mailApp.composeNew')}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
