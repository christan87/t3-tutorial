import type { PropsWithChildren } from "react";

export const PageLayout = (props: PropsWithChildren<{}>) => {
    return (
        <main className="flex justify-center h-screen">
            <div className="w-full h-full overflow-y-scroll border-x md:max-w-2xl border-slate-400">
                {props.children}
            </div>
        </main>
    );
};