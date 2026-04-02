interface AuthorInfo {
	contacts: Record<string, string>;
	profilePicture?: string;
}

const authorData: Record<string, AuthorInfo> = {
	aniketh: {
		contacts: {
			linkedin: 'https://www.linkedin.com/in/aniketh-reddimi',
			twitter: 'https://x.com/thekingofxor',
			github: 'https://github.com/p4r4xor',
			email: 'hi@paraxor.dev',
			discord: 'truelights',
		},
		profilePicture: '/aniketh.jpg',
	},
};

export type Authors = keyof typeof authorData;

export function AuthorLinks({ author }: { author: Authors }) {
	const links = authorData[author];
	if (!links) {
		return null;
	}

	return (
		<div className="flex flex-row items-start border-t border-neutral-800 pt-4 gap-4">
			{links.profilePicture && (
				<img
					src={links.profilePicture}
					alt={`${author} profile picture`}
					className="w-24 h-24 rounded-full not-prose"
				/>
			)}
			<div className="w-px bg-neutral-800 self-stretch" />
			<div className="flex flex-col text-sm overflow-hidden">
				<span className="mb-1">Find {author} on:</span>
				{Object.entries(links.contacts).map(([name, link]) => {
					if (link.startsWith('http')) {
						return (
							<span key={link} className="truncate">
								{name}:{' '}
								<a key={name} className="underline" href={link}>
									{link}
								</a>
							</span>
						);
					} else {
						return (
							<span key={name}>
								{name}: {link}
							</span>
						);
					}
				})}
			</div>
		</div>
	);
}
