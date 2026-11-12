import { useProfile } from '../../hooks/useProfile'
import { PROFILES, type Profile } from '../../types/profile'

export function ProfileSwitcher() {
    const { profile, setProfile } = useProfile()

    return (
        <label className="profile-switcher">
            <span className="profile-switcher__label">Perfil simulado</span>
            <select
                value={profile}
                onChange={(event) => setProfile(event.target.value as Profile)}
            >
                {PROFILES.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </label>
    )
}