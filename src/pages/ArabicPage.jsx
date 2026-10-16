import React from 'react';
import { useAccess } from '../context/AccessContext.jsx';
import { StatusBadge, DeviceBadge } from '../components/StatusBadge.jsx';
import { 
  Globe2, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  Award, 
  Database, 
  Lock, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ArabicPage = () => {
  const { decision } = useAccess();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12" dir="rtl">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950 text-white p-8 sm:p-12 shadow-2xl border border-amber-900/50 mb-8 sm:mb-12">
        <div className="absolute top-0 left-0 -mt-12 -ml-12 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 w-96 h-96 rounded-full bg-yellow-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-amber-200 border border-amber-400/30">
              <Globe2 className="w-4 h-4 text-amber-300" />
              <span>البوابة الإقليمية المعتمدة (السعودية والإمارات)</span>
            </div>
            {decision && <StatusBadge status={decision.allowed ? 'allowed' : 'blocked'} />}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white leading-relaxed">
            بوابة هندسة الويب والتحكم بالوصول <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-300">
              نظام التوجيه الإقليمي الذكي
            </span>
          </h1>

          <p className="text-amber-100/90 text-base sm:text-lg max-w-2xl leading-loose mb-8 font-medium">
            مرحبًا بكم في المنصة الجامعية للتحكم في الوصول. يتم تطبيق قواعد الحماية والتوجيه اللغوي تلقائيًا بناءً على موقعكم الجغرافي ونوع الجهاز المعتمد مع تسجيل فوري للبيانات.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition shadow-lg shadow-amber-600/30 hover:scale-[1.02]"
            >
              <span>لوحة التحكم الإدارية</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-medium">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>توجيه تلقائي باللغة العربية</span>
            </div>
          </div>
        </div>
      </div>

      {/* Access Verification Card */}
      {decision && (
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm mb-8 sm:mb-12">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span>تفاصيل تصريح الدخول والبيانات المكتشفة</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              موثق عبر خوادم الحماية
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 hover:border-amber-100 transition">
              <span className="text-xs font-medium text-slate-500 block mb-1">الدولة المكتشفة</span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="truncate">{decision.country}</span>
              </span>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 hover:border-amber-100 transition">
              <span className="text-xs font-medium text-slate-500 block mb-1">المدينة</span>
              <span className="text-sm font-bold text-slate-800 truncate block">
                {decision.city && decision.city !== 'Unknown' ? decision.city : 'غير محدد'}
              </span>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 hover:border-amber-100 transition">
              <span className="text-xs font-medium text-slate-500 block mb-1">نوع الجهاز</span>
              <DeviceBadge deviceType={decision.deviceType} />
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 hover:border-amber-100 transition">
              <span className="text-xs font-medium text-slate-500 block mb-1">اللغة المعتمدة</span>
              <span className="inline-flex items-center gap-1 text-sm font-extrabold text-amber-700">
                <Globe2 className="w-4 h-4 text-amber-600" />
                العربية (AR)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-200 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">توجيه إقليمي فوري</h3>
            <p className="text-sm text-slate-600 leading-loose">
              توجيه آلي مباشر لزوار المملكة العربية السعودية ودولة الإمارات العربية المتحدة إلى النسخة العربية المعتمدة.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Lock className="w-3.5 h-3.5" /> قواعد أمان مشفرة
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-200 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center mb-5 border border-yellow-100">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">سجل الدخول الآمن</h3>
            <p className="text-sm text-slate-600 leading-loose">
              تسجيل بيانات عنوان IP والجهاز وحالة الدخول مباشرة في قاعدة بيانات Supabase PostgreSQL لضمان الشفافية.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-yellow-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> حماية على مستوى الصفوف (RLS)
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-200 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-100">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">لوحة المراقبة الإدارية</h3>
            <p className="text-sm text-slate-600 leading-loose">
              واجهة مخصصة تمكن المسؤولين من تصفية السجلات حسب الدولة ونوع الجهاز والحالة مع مؤشرات إحصائية حية.
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Award className="w-3.5 h-3.5" /> تحليلات متقدمة
          </div>
        </div>
      </div>
    </div>
  );
};
