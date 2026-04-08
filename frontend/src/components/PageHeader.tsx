type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export const PageHeader = ({ eyebrow, title, description }: PageHeaderProps) => (
  <header className="page-header">
    <div className="page-header__content">
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      {description ? <p className="page-description">{description}</p> : null}
    </div>
  </header>
);
