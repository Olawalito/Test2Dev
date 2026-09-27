CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE Projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    owner_id INTEGER NOT NULL,

    CONSTRAINT fk_project_owner
        FOREIGN KEY (owner_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE TABLE project_members (
    user_id INTEGER NOT NULL,
    project_id INTEGER NOT NULL,
    role VARCHAR(100) NOT NULL,

    CONSTRAINT fk_members
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_project_member
        UNIQUE(user_id, project_id)

);

CREATE TABLE items(
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(1500) NOT NULL,
    status VARCHAR(100) NOT NULL,
    severity VARCHAR(20),
    reported_by INTEGER NOT NULL,
    assigned_to INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_project
        FOREIGN KEY (project_id)
        REFERENCES projects(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_reporter
        FOREIGN KEY (reported_by)
        REFERENCES users(id),

    CONSTRAINT fk_assigned
        FOREIGN KEY (assigned_to)
        REFERENCES users(id)
    
);

CREATE TABLE comments(
    id SERIAL PRIMARY KEY,

    item_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,

    body TEXT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_comment_item
        FOREIGN KEY (item_id)
        REFERENCES items(id)
        ON DELETE CASCADE,
    
    CONSTRAINT fk_comment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

ALTER TABLE project_members
ADD CONSTRAINT check_project_member_role
CHECK( role IN ('owner','developer','tester','pm'));

ALTER TABLE items 
ADD CONSTRAINT check_type
CHECK( type IN ('bug', 'requirement'));

ALTER TABLE items 
ADD CONSTRAINT check_status
CHECK( status IN ('unsolved', 'solved', 'ignored'));

ALTER TABLE items 
ADD CONSTRAINT check_item_severity
CHECK (
    (type = 'bug' AND severity IS NOT NULL)
    or
    (type = 'requirement' AND severity is NULL)
);
