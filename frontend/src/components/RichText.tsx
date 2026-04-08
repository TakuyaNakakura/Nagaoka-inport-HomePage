type RichTextProps = {
  value?: string | null;
};

export const RichText = ({ value }: RichTextProps) => {
  if (!value) {
    return <p className="muted-text">未設定</p>;
  }

  return (
    <div className="rich-text">
      {value.split("\n").map((paragraph, index) => (
        <p key={`${paragraph}-${index}`}>{paragraph || " "}</p>
      ))}
    </div>
  );
};

