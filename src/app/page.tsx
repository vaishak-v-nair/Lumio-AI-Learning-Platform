
import Image from 'next/image';
import AuthForm from '@/components/auth/AuthForm';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LumioLogo } from '@/components/LumioLogo';

export default function AuthenticationPage() {

  return (
    <div className="relative min-h-screen w-full">
      <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/10 blur-[100px]"></div>
      </div>
       <div className="flex min-h-screen flex-col items-center justify-center p-6">
          <div className="mx-auto grid w-[380px] max-w-full gap-6">
            <div className="grid gap-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <LumioLogo />
                <h1 className="text-3xl font-bold font-headline text-primary">Lumio</h1>
              </div>
              <p className="text-balance text-muted-foreground">
                Your personalized path to mastery begins here.
              </p>
            </div>
            <AuthForm />
          </div>
      </div>
    </div>
  );
}
