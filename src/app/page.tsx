import Image from 'next/image';
import AuthForm from '@/components/auth/AuthForm';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LumioLogo } from '@/components/LumioLogo';

export default function AuthenticationPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'auth-hero');

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-12">
        <div className="mx-auto grid w-[350px] gap-6">
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
      <div className="hidden bg-muted lg:block relative">
        {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              data-ai-hint={heroImage.imageHint}
              fill
              className="h-full w-full object-cover dark:brightness-[0.3]"
            />
        )}
      </div>
    </div>
  );
}
