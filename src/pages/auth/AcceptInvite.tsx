import React from 'react';
import { Formik, Form } from 'formik';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { usePreviewInviteTokenQuery, useRedeemInviteMutation } from '@/services/inviteService';
import { Button, FormInput } from '@/components';
import { useToastContext } from '@/components/toast/ToastProvider';
import PasswordValidator from '@/components/ui/PasswordValidator';
import { useAuth } from '@/hooks/useAuth';

interface InviteFormValues {
  first_name: string;
  last_name: string;
  password: string;
}

function validateInviteForm(values: InviteFormValues) {
  const errors: Partial<InviteFormValues> = {};
  if (!values.first_name?.trim()) errors.first_name = 'First name is required';
  if (!values.last_name?.trim()) errors.last_name = 'Last name is required';
  if (!values.password) {
    errors.password = 'Password is required';
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters';
  } else if (!/[A-Z]/.test(values.password)) {
    errors.password = 'Password must include an uppercase letter';
  } else if (!/[0-9]/.test(values.password)) {
    errors.password = 'Password must include a number';
  }
  return errors;
}

const ErrorState: React.FC<{ title: string; subtitle: string }> = ({ title, subtitle }) => (
  <div className="flex flex-col items-center justify-center text-center gap-6 py-12 px-6">
    <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center text-red-500">
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <div className="flex flex-col gap-2 max-w-sm">
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
      <p className="text-gray-500 font-medium leading-relaxed">{subtitle}</p>
    </div>
    <Link to="/login" className="mt-2 text-primary-600 font-bold hover:text-primary-700 transition-all">
      Back to Login →
    </Link>
  </div>
);

const AcceptInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const toast = useToastContext();
  const { isLoggedIn } = useAuth();

  const { data, isLoading, isError } = usePreviewInviteTokenQuery(token || '');
  const redeemMutation = useRedeemInviteMutation();

  const invite = (data as any)?.payload || (data as any);
  const isValid = invite?.valid;
  const errorCode = invite?.code;
  const email = invite?.email || '';
  const userExists = invite?.user_exists;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-6 px-10">
        <div className="w-16 h-16 border-4 border-primary-100 rounded-full relative">
          <div className="absolute inset-0 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-lg font-black text-gray-900 tracking-tight">Verifying invitation...</p>
      </div>
    );
  }

  if (!isValid || isError) {
    const msgs: Record<string, { title: string; subtitle: string }> = {
      EXPIRED: { title: 'Invitation Expired', subtitle: 'This invitation has expired. Ask your administrator for a new link.' },
      USED: { title: 'Already Used', subtitle: 'This invitation has already been redeemed. Try logging in.' },
    };
    const msg = msgs[errorCode] || { title: 'Invitation Invalid', subtitle: 'This invitation link is no longer valid.' };
    return <ErrorState {...msg} />;
  }

  if (!isLoggedIn && userExists) {
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Welcome Back</h1>
        <p className="text-gray-500 font-medium">This invite is linked to an existing account (<strong>{email}</strong>). Log in to accept it.</p>
        <Button variant="primary" size="lg" fullWidth className="h-14 rounded-xl font-bold"
          onClick={() => navigate('/login', { state: { fromInvite: token, email } })}>
          Log In to Continue
        </Button>
      </div>
    );
  }

  if (isLoggedIn && isValid) {
    const handleRedeem = async () => {
      try {
        await redeemMutation.mutateAsync({ token });
        toast.success('Invitation accepted!');
        navigate('/');
      } catch (err: any) {
        toast.error(err?.data?.message || 'Failed to accept invitation.');
      }
    };
    return (
      <div className="flex flex-col gap-8">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Accept Invitation</h1>
        <p className="text-gray-500 font-medium">You've been invited to join the team. Click below to confirm.</p>
        <Button variant="primary" size="lg" fullWidth className="h-14 rounded-xl font-bold"
          loading={redeemMutation.isPending} onClick={handleRedeem}>
          Join Team Now
        </Button>
      </div>
    );
  }

  const handleSubmit = async (values: InviteFormValues) => {
    try {
      await redeemMutation.mutateAsync({ token, ...values, email });
      toast.success('Account created! Please log in.');
      navigate('/login');
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || 'Failed to create account.');
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <h1 className="text-4xl font-black text-gray-900 tracking-tight">Join the Team</h1>
        <p className="text-gray-500 font-medium">Fill in your details to create your account and accept your invitation.</p>
      </div>

      {/* BUG-017 FIX: validate prop now passed */}
      <Formik<InviteFormValues>
        initialValues={{ first_name: '', last_name: '', password: '' }}
        validate={validateInviteForm}
        onSubmit={handleSubmit}
      >
        {({ values, handleChange, handleBlur, errors, touched }) => (
          <Form className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <FormInput label="FIRST NAME" name="first_name" type="text" placeholder="John"
                value={values.first_name} onChange={handleChange} onBlur={handleBlur}
                labelClassName="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1"
                error={touched.first_name && errors.first_name ? errors.first_name : undefined} />
              <FormInput label="LAST NAME" name="last_name" type="text" placeholder="Doe"
                value={values.last_name} onChange={handleChange} onBlur={handleBlur}
                labelClassName="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1"
                error={touched.last_name && errors.last_name ? errors.last_name : undefined} />
            </div>
            <FormInput label="YOUR EMAIL" name="email" type="email" value={email} disabled
              labelClassName="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1"
              className="bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed" />
            <div className="flex flex-col gap-4">
              <FormInput label="CREATE PASSWORD" name="password" type="password" placeholder="••••••••"
                value={values.password} onChange={handleChange} onBlur={handleBlur}
                labelClassName="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1"
                error={touched.password && errors.password ? errors.password : undefined} />
              <PasswordValidator password={values.password} />
            </div>
            <Button type="submit" variant="primary" fullWidth size="lg"
              loading={redeemMutation.isPending} disabled={redeemMutation.isPending}
              className="h-14 rounded-xl shadow-xl font-bold">
              Get Started
            </Button>
          </Form>
        )}
      </Formik>

      <div className="text-center text-sm text-gray-400 border-t border-gray-100 pt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-primary-600 font-black hover:text-primary-700">Log in</Link>
      </div>
    </div>
  );
};

export default AcceptInvite;
