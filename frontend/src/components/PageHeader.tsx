type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export const PageHeader = ({ eyebrow, title, description }: PageHeaderProps) => (
  <header className="page-header">
    {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
    <h1>{title}</h1>
    {description ? <p className="page-description">{description}</p> : null}
  </header>
);

