export default function RoleCard({ role, title, desc, selected, onClick }) {
    return (
        <div
            onClick={onClick}
            className={`
            relative p-8 rounded-xl border-2 cursor-pointer transition-all duration-200 ease-in-out
            flex flex-col gap-3 h-full bg-white
            ${selected
                    ? 'border-brand shadow-md ring-1 ring-brand bg-brand/5'
                    : 'border-theme-light hover:border-theme-gray/30 hover:shadow-sm'
                }
          `}
        >
            <h3 className="text-xl font-bold text-theme-dark">{title}</h3>
            <p className="text-theme-gray leading-relaxed">{desc}</p>
        </div>
    );
}