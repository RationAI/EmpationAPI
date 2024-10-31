import DefaultIntegration, {DefaultIntegrationOptions} from "./default";

interface LSAAIIntegrationOptions extends DefaultIntegrationOptions {
    userinfo: string
}

type GroupName = {
    name?: string,
    slug?: string
}

export default class LSAAIIntegration extends DefaultIntegration<LSAAIIntegrationOptions> {

    private userData: any;

    async translatePathSpec(specKey: string, value: string): Promise<string> {
        if (!this.context.accessToken || !this.props.userinfo) {
            return value;
        }

        if (!this.userData) {
            await this.parseUserInstitutionsAndProjects();
        }

        if (specKey === "id_part_1") {
            return this.userData.institutions[value] || value;
        }
        if (specKey === "id_part_2") {
            return this.userData.projects[value] || value;
        }
        return value;
    }

    private parseGroupName (name: string): GroupName {
        if (!name) return { name: name, slug: name }
        name = decodeURIComponent(name).trim()
        const match = name.match(/^(.+)\.\s*([^.\s]{1,5})$/)
        if (match && match.length === 3) {
            return { name: match[1].trim(), slug: match[2].trim() }
        }
        if (name.length > 5) {
            console.warn('Invalid group name', name)
            return {}
        }
        return { name: name, slug: name }
    }

    private async parseUserInstitutionsAndProjects () {
        const response = await fetch(this.props.userinfo, {
            headers: {
                'Authorization': `Bearer ${this.context.accessToken}`
            }
        });

        const data = await response.text();
        if (!response.ok) {
            throw new Error(`Failed to fetch user info! ${response.statusText}. ${data}`);
        }
        const parsedData = JSON.parse(data);


        const result = this.userData = {
            projects: {
                '': { label: 'NO PROJECT', value: '', rights: ['write'] }
            },
            institutions: {
                '': { label: 'PUBLIC DATA', value: ''}

            }
        };

        try {
            const entitlements = parsedData.eduperson_entitlement
            if (entitlements) {
                // Parse AARCG069 for groups
                for (const rule of entitlements) {
                    // parse group (institution) hierarchy (todo hardcoded - env ?)
                    const match = rule.match(/^.*?:group:ration_ai:([^#\n]*)/)
                    if (match && match.length > 1) {
                        const groups = match[1]?.split(':')
                        if (groups) {
                            const length = groups.length,
                                project = this.parseGroupName(groups[0]),
                                organization = this.parseGroupName(length > 1 ? groups[1] : ''),
                                rights = this.parseGroupName(length > 2 ? groups[2] : null)

                            if (organization.slug && !result.institutions[organization.slug]) {
                                result.institutions[organization.slug] = {
                                    label: organization.name,
                                    value: organization.slug
                                }
                            }
                            if (project.slug && !result.projects[project.slug]) {
                                result.projects[project.slug] = {
                                    label: project.name,
                                    value: project.slug,
                                    rights: rights ? [rights] : []
                                };
                            } else if (rights && project.slug) {
                                result.projects[project.slug].rights.push(rights.slug);
                            }
                        }
                    } else {
                        console.warn('Ignored entitlement', rule)
                    }
                }

            } else {
                console.warn('User info data does not contain access information! Is OAUTH scope set correctly?')
            }
        } catch (e) {
            console.warn('Could not decide user authorization capabilities!', e)
        }
    }
}
