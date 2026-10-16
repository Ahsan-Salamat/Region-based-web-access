import React from 'react';
import { useAccess } from '../context/AccessContext.jsx';
import { StatusBadge, DeviceBadge } from '../components/StatusBadge.jsx';
import { 
  Globe2, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2, 
  Award, 
  Smartphone, 
  Database, 
  Lock, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const UrduPage = () => {
  const { decision } = useAccess();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12" dir="rtl">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white p-8 sm:p-12 shadow-2xl border border-emerald-900/50 mb-8 sm:mb-12">
        <div className="absolute top-0 left-0 -mt-12 -ml-12 w-96 h-96 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 -mb-12 -mr-12 w-96 h-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider text-emerald-200 border border-emerald-400/30">
              <Globe2 className="w-4 h-4 text-emerald-300" />
              <span>قومی پورٹل (پاکستان)</span>
            </div>
            {decision && <StatusBadge status={decision.allowed ? 'allowed' : 'blocked'} />}
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 text-white leading-relaxed">
            جامعہ ویب انجینئرنگ پورٹل <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-lime-300">
              علاقائی رسائی کا بااختیار کنٹرول
            </span>
          </h1>

          <p className="text-emerald-100/90 text-base sm:text-lg max-w-2xl leading-loose mb-8 font-medium">
            یہ خودکار نظام آپ کے تصدیق شدہ جغرافیائی مقام اور موبائل آلات کی بنیاد پر اردو زبان میں محفوظ اور تیز رفتار رسائی فراہم کرتا ہے۔ تمام وزٹس ڈیٹا بیس میں محفوظ کی جاتی ہیں۔
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-lg shadow-emerald-600/30 hover:scale-[1.02]"
            >
              <span>ایڈمن ڈیش بورڈ کھولیں</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-medium">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>پالیسی: پاکستان سے موبائل ڈیوائسز کے لیے تصدیق شدہ</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pakistan Mobile Rule Confirmation Alert Box */}
      <div className="bg-emerald-50/90 backdrop-blur-md border border-emerald-200/80 rounded-2xl p-5 sm:p-6 mb-8 sm:mb-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-sm">
        <div className="p-3 rounded-2xl bg-emerald-600 text-white shrink-0 shadow-md shadow-emerald-600/20">
          <Smartphone className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-emerald-950 mb-1">
            موبائل ڈیوائس کی کامیاب توثیق
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed font-medium">
            سیکیورٹی قوانین کے تحت پاکستان سے صرف موبائل صارفین کو اس ویب پورٹل تک رسائی کی اجازت ہے۔ آپ کے موبائل ڈیوائس کی تصدیق ہو چکی ہے اور سیشن لاگ ڈیٹا بیس میں درج ہے۔
          </p>
        </div>
      </div>

      {/* Access Verification Card */}
      {decision && (
        <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm mb-8 sm:mb-12">
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span>سیشن اور سیکیورٹی کی مکمل معلومات</span>
            </h2>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              سرور سائیڈ تصدیق شدہ
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 hover:border-emerald-100 transition">
              <span className="text-xs font-medium text-slate-500 block mb-1">ملک کا نام</span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="truncate">{decision.country}</span>
              </span>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 hover:border-emerald-100 transition">
              <span className="text-xs font-medium text-slate-500 block mb-1">شہر</span>
              <span className="text-sm font-bold text-slate-800 truncate block">
                {decision.city && decision.city !== 'Unknown' ? decision.city : 'نامعلوم'}
              </span>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 hover:border-emerald-100 transition">
              <span className="text-xs font-medium text-slate-500 block mb-1">ڈیوائس کی قسم</span>
              <DeviceBadge deviceType={decision.deviceType} />
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100/80 hover:border-emerald-100 transition">
              <span className="text-xs font-medium text-slate-500 block mb-1">مقرر کردہ زبان</span>
              <span className="inline-flex items-center gap-1 text-sm font-extrabold text-emerald-700">
                <Globe2 className="w-4 h-4 text-emerald-600" />
                اردو (UR)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Feature Grid */}
      <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">خودکار علاقائی توثیق</h3>
            <p className="text-sm text-slate-600 leading-loose">
              سرور سائیڈ آئی پی جیو لوکیشن اور ڈیوائس کی قسم کا تجزیہ کرتے ہوئے سیکیورٹی رولز کا بر وقت نفاذ۔
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <Lock className="w-3.5 h-3.5" /> سرور سائیڈ پالیسی
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-5 border border-teal-100">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">ڈیٹا بیس لاگنگ</h3>
            <p className="text-sm text-slate-600 leading-loose">
              ہر درخواست کی مکمل تفصیلات Supabase PostgreSQL میں محفوظ کی جاتی ہیں تاکہ شفافیت برقرار رہے۔
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-teal-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> محفوظ آڈٹ ٹریل
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">ایڈمن ڈیش بورڈ</h3>
            <p className="text-sm text-slate-600 leading-loose">
              ایڈمن پینل کے ذریعے ملک، تاریخ اور ڈیوائس کی بنیاد پر لاگز کو فلٹر اور تجزیہ کرنے کی سہولت۔
            </p>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-1 text-xs font-semibold text-emerald-600">
            <Award className="w-3.5 h-3.5" /> فلٹرنگ اور تجزیہ
          </div>
        </div>
      </div>
    </div>
  );
};
